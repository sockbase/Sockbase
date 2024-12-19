import { type FirebaseError } from 'firebase-admin'
import * as functions from 'firebase-functions'
import {
  type SockbaseTicketDocument,
  type SockbaseTicket,
  type SockbaseTicketAddedResult,
  type SockbaseTicketCreatedResult,
  type SockbaseTicketUsedStatus,
  type SockbaseStoreDocument,
  type SockbaseStoreType,
  type SockbaseAccountDocument,
  type PaymentMethod
} from 'sockbase'
import dayjs from '../helpers/dayjs'
import random from '../helpers/random'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { storeConverter, ticketConverter, ticketUsedStatusConverter, ticketUserConverter, userConverter } from '../libs/converters'
import { sendMessageToDiscord } from '../libs/sendWebhook'
import PaymentService from './PaymentService'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()
const auth = adminApp.auth()

const createTicketAsync = async (userId: string, ticket: SockbaseTicket): Promise<SockbaseTicketAddedResult> => {
  const now = new Date()
  const timestamp = now.getTime()

  const storeId = ticket.storeId

  const storeDoc = await firestore.doc(`stores/${storeId}`)
    .withConverter(storeConverter)
    .get()
  const store = storeDoc.data()
  if (!store) {
    throw new functions.https.HttpsError('not-found', 'store')
  }
  else if (store.schedules.startApplication >= timestamp || timestamp > store.schedules.endApplication) {
    throw new functions.https.HttpsError('deadline-exceeded', 'store_out_of_term')
  }
  else if (!store.permissions.canUseBankTransfer && ticket.paymentMethod === 'bankTransfer') {
    throw new functions.https.HttpsError('invalid-argument', 'invalid_argument_bankTransfer')
  }

  const type = store.types
    .filter(t => t.isPublic)
    .filter(t => t.id === ticket.typeId)[0]
  if (!type) {
    throw new functions.https.HttpsError('not-found', 'type')
  }

  const createdResult = await createTicketCoreAsync(
    userId,
    store,
    type,
    ticket.paymentMethod === 'online' ? 1 : 2,
    false,
    now)
  await updateTicketUserDataAsync(userId, store.id)

  if (type.anotherTicket?.storeId && type.anotherTicket?.typeId) {
    const anotherTicketStoreDoc = await firestore.doc(`stores/${type.anotherTicket.storeId}`)
      .withConverter(storeConverter)
      .get()
    const anotherTicketStore = anotherTicketStoreDoc.data()
    if (!anotherTicketStore) {
      throw new functions.https.HttpsError('not-found', 'anotherTicketStore')
    }

    const anotherTicketType = anotherTicketStore.types.filter(t => t.id === type.anotherTicket?.typeId)[0]
    if (!anotherTicketType) {
      throw new functions.https.HttpsError('not-found', 'anotherTicketType')
    }

    await createTicketCoreAsync(userId, anotherTicketStore, anotherTicketType, 1, true, now)
    await updateTicketUserDataAsync(userId, anotherTicketStore.id)
  }

  const webhookBody = {
    username: `Sockbase: ${store.name}`,
    embeds: [
      {
        title: 'チケット申し込みを受け付けました！',
        url: '',
        color: 65280,
        fields: [
          {
            name: 'チケットストア名',
            value: store.name
          },
          {
            name: '種類',
            value: type.name
          }
        ]
      }
    ]
  }

  await sendMessageToDiscord(store._organization.id, webhookBody)
    .then(() => console.log('sent webhook'))
    .catch(err => { throw err })

  return {
    hashId: createdResult.hashId,
    bankTransferCode: createdResult.bankTransferCode
  }
}

const createTicketForAdminAsync =
  async (
    createdUserId: string,
    storeId: string,
    typeId: string,
    email: string | null
  ): Promise<SockbaseTicketCreatedResult> => {
    const now = new Date()

    const user = email
      ? await auth
        .getUserByEmail(email)
        .catch((err: FirebaseError) => {
          if (err.code === 'auth/user-not-found') {
            throw new functions.https.HttpsError('not-found', 'user_not_found')
          }
          else {
            console.error(err)
            throw new functions.https.HttpsError('internal', 'auth')
          }
        })
      : null

    const storeDoc = await firestore.doc(`stores/${storeId}`)
      .withConverter(storeConverter)
      .get()
    const store = storeDoc.data()
    if (!store) {
      throw new functions.https.HttpsError('not-found', 'store')
    }

    const type = store.types.filter(t => t.id === typeId)[0]
    if (!type) {
      throw new functions.https.HttpsError('not-found', 'type')
    }

    const createdResult = await createTicketCoreAsync(
      user?.uid ?? null,
      store,
      type,
      1,
      false,
      now,
      createdUserId)

    if (user) {
      await updateTicketUserDataAsync(user.uid, store.id)
    }

    if (user && type.anotherTicket?.storeId && type.anotherTicket?.typeId) {
      const anotherTicketStoreDoc = await firestore.doc(`stores/${type.anotherTicket.storeId}`)
        .withConverter(storeConverter)
        .get()
      const anotherTicketStore = anotherTicketStoreDoc.data()
      if (!anotherTicketStore) {
        throw new functions.https.HttpsError('not-found', 'anotherTicketStore')
      }

      const anotherTicketType = anotherTicketStore.types.filter(t => t.id === type.anotherTicket?.typeId)[0]
      if (!anotherTicketType) {
        throw new functions.https.HttpsError('not-found', 'anotherTicketType')
      }

      await createTicketCoreAsync(user.uid, anotherTicketStore, anotherTicketType, 1, true, now, createdUserId)
      await updateTicketUserDataAsync(user.uid, anotherTicketStore.id)
    }

    return {
      ...createdResult.ticketDoc,
      id: createdResult.ticketId,
      createdAt: createdResult.ticketDoc.createdAt?.getTime() ?? 0,
      email: user?.email ?? ''
    }
  }

const createTicketCoreAsync =
  async (
    userId: string | null,
    store: SockbaseStoreDocument,
    type: SockbaseStoreType,
    paymentMethod: PaymentMethod,
    isAnotherTicket: boolean,
    now: Date,
    createdUserId?: string
  ): Promise<SockbaseTicketAddedResult & {
    ticketDoc: SockbaseTicketDocument
    ticketId: string
  }> => {
    const isAdmin = !!createdUserId || isAnotherTicket
    const isStandalone = !userId

    const hashId = generateTicketHashId(now)
    const ticketDoc: SockbaseTicketDocument = {
      id: '',
      storeId: store.id,
      typeId: type.id,
      paymentMethod: paymentMethod === 1 || isStandalone || isAdmin ? 'online' : 'bankTransfer',
      userId,
      createdAt: now,
      updatedAt: now,
      hashId,
      createdUserId: createdUserId ?? null,
      isStandalone
    }

    const ticketResult = await firestore
      .collection('_tickets')
      .withConverter(ticketConverter)
      .add(ticketDoc)
    const ticketId = ticketResult.id

    const bankTransferCode = PaymentService.generateBankTransferCode(now)
    const paymentId = type.productInfo && !isAdmin && userId
      ? await PaymentService.createPaymentAsync(
        userId,
        paymentMethod,
        bankTransferCode,
        type.productInfo.productId,
        type.price,
        'ticket',
        ticketId
      )
      : null

    await firestore
      .doc(`/_tickets/${ticketId}/private/usedStatus`)
      .withConverter(ticketUsedStatusConverter)
      .set({
        used: false,
        usedAt: null
      })

    await firestore
      .doc(`/_ticketHashIds/${hashId}`)
      .set({
        hashId,
        ticketId,
        paymentId
      })

    await firestore
      .doc(`/_tickets/${ticketId}/private/meta`)
      .set({
        applicationStatus: isAdmin || isStandalone ? 2 : 0
      })

    if (!isStandalone) {
      await firestore
        .doc(`/_ticketUsers/${hashId}`)
        .set({
          userId,
          storeId: store.id,
          typeId: type.id,
          usableUserId: store.permissions.ticketUserAutoAssign ? userId : null,
          used: false,
          usedAt: null
        })
    }

    return {
      ticketId,
      ticketDoc,
      hashId,
      bankTransferCode
    }
  }

const generateTicketHashId = (now: Date): string => {
  const codeDigit = 12
  const randomId = random.generateRandomCharacters(codeDigit, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  const formatedDateTime = dayjs(now).tz().format('MMDD')
  const hashId = `ST${formatedDateTime}${randomId}`
  return hashId
}

const updateTicketUsedStatusAsync = async (ticketId: string, ticketUsed: SockbaseTicketUsedStatus): Promise<void> => {
  const ticketDoc = await firestore
    .doc(`/_tickets/${ticketId}`)
    .withConverter(ticketConverter)
    .get()
  const ticket = ticketDoc.data()
  if (!ticket) {
    throw new Error('ticket not found')
  }

  await firestore
    .doc(`/_ticketUsers/${ticket.hashId}`)
    .withConverter(ticketUserConverter)
    .set({
      used: ticketUsed.used,
      usedAt: ticketUsed.usedAt
    }, { merge: true })
}

const updateTicketUserDataAsync =
  async (userId: string, storeId: string): Promise<void> => {
    const userDoc = await firestore
      .doc(`/users/${userId}`)
      .withConverter(userConverter)
      .get()
    const userData = userDoc.data()
    if (!userData) {
      throw new functions.https.HttpsError('not-found', 'user')
    }

    await updateTicketUserDataCoreAsync(userId, storeId, userData)
  }

const updateTicketUserDataCoreAsync =
  async (userId: string, storeId: string, userData: SockbaseAccountDocument): Promise<void> => {
    await firestore
      .doc(`stores/${storeId}/_users/${userId}`)
      .withConverter(userConverter)
      .set(userData)
  }

export default {
  createTicketAsync,
  createTicketForAdminAsync,
  updateTicketUsedStatusAsync,
  updateTicketUserDataAsync,
  createTicketCoreAsync,
  generateTicketHashId,
  updateTicketUserDataCoreAsync
}
