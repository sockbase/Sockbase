import { type FirebaseError } from 'firebase-admin'
import * as functions from 'firebase-functions'
import {
  type SockbaseTicketDocument,
  type SockbaseTicket,
  type SockbaseTicketAddedResult,
  type SockbaseTicketCreatedResult,
  type SockbaseTicketUsedStatus,
  type SockbaseStoreDocument,
  type SockbaseStoreType
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
  } else if (store.schedules.startApplication >= timestamp || timestamp > store.schedules.endApplication) {
    throw new functions.https.HttpsError('deadline-exceeded', 'store_out_of_term')
  } else if (!store.permissions.canUseBankTransfer && ticket.paymentMethod === 'bankTransfer') {
    throw new functions.https.HttpsError('invalid-argument', 'invalid_argument_bankTransfer')
  }

  const type = store.types
    .filter(t => t.isPublic)
    .filter(t => t.id === ticket.typeId)[0]
  if (!type) {
    throw new functions.https.HttpsError('not-found', 'type')
  }

  const createdResult = await createTicketCoreAsync(userId, store, type, ticket, false, now)

  if (type.anotherTicket) {
    const anotherTicket: SockbaseTicket = {
      storeId: type.anotherTicket.storeId,
      typeId: type.anotherTicket.typeId,
      paymentMethod: 'online'
    }
    await createTicketCoreAsync(userId, store, type, anotherTicket, true, now)
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

const createTicketForAdminAsync = async (createdUserId: string, store: SockbaseStoreDocument, typeId: string, email: string): Promise<SockbaseTicketCreatedResult> => {
  const now = new Date()

  const user = await auth
    .getUserByEmail(email)
    .catch((err: FirebaseError) => {
      if (err.code === 'auth/user-not-found') {
        throw new functions.https.HttpsError('not-found', 'user_not_found')
      } else {
        console.error(err)
        throw new functions.https.HttpsError('internal', 'auth')
      }
    })

  const type = store.types
    .filter(t => t.isPublic)
    .filter(t => t.id === typeId)[0]
  if (!type) {
    throw new functions.https.HttpsError('not-found', 'type')
  }

  const ticket: SockbaseTicket = {
    storeId: store.id,
    typeId,
    paymentMethod: 'online'
  }

  const createdResult = await createTicketCoreAsync(user.uid, store, type, ticket, false, now, createdUserId)

  if (type.anotherTicket) {
    const anotherTicket: SockbaseTicket = {
      storeId: type.anotherTicket.storeId,
      typeId: type.anotherTicket.typeId,
      paymentMethod: 'online'
    }
    await createTicketCoreAsync(user.uid, store, type, anotherTicket, true, now, createdUserId)
  }

  return {
    ...createdResult.ticketDoc,
    id: createdResult.ticketId,
    createdAt: createdResult.ticketDoc.createdAt?.getTime() ?? 0,
    email: user.email ?? ''
  }
}

const createTicketCoreAsync =
  async (
    userId: string,
    store: SockbaseStoreDocument,
    type: SockbaseStoreType,
    ticket: SockbaseTicket,
    isAnotherTicket: boolean,
    now: Date,
    createdUserId?: string
  ): Promise<SockbaseTicketAddedResult & {
    ticketDoc: SockbaseTicketDocument
    ticketId: string
  }> => {
    const isAdmin = !!createdUserId || isAnotherTicket

    const hashId = generateTicketHashId(now)
    const ticketDoc: SockbaseTicketDocument = {
      ...ticket,
      userId,
      createdAt: now,
      updatedAt: now,
      hashId,
      createdUserId: createdUserId ?? null
    }

    const ticketResult = await firestore
      .collection('_tickets')
      .withConverter(ticketConverter)
      .add(ticketDoc)
    const ticketId = ticketResult.id

    const bankTransferCode = PaymentService.generateBankTransferCode(now)
    const paymentId = type.productInfo && !isAdmin
      ? await PaymentService.createPaymentAsync(
        userId,
        ticket.paymentMethod === 'online' ? 1 : 2,
        bankTransferCode,
        type.productInfo.productId,
        type.price,
        'ticket',
        ticketId
      )
      : null

    await firestore
      .doc(`/_tickets/${ticketId}/private/meta`)
      .set({
        applicationStatus: isAdmin ? 2 : 0
      })

    await firestore
      .doc(`/_tickets/${ticketId}/private/usedStatus`)
      .withConverter(ticketUsedStatusConverter)
      .set({
        used: false,
        usedAt: null
      })

    await firestore
      .doc(`/_ticketUsers/${hashId}`)
      .set({
        userId,
        storeId: store.id,
        typeId: ticket.typeId,
        usableUserId: store.permissions.ticketUserAutoAssign ? userId : null,
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

    await updateTicketUserDataAsync(store.id, userId)

    return {
      ticketId,
      ticketDoc,
      hashId,
      bankTransferCode
    }
  }

export const generateTicketHashId = (now: Date): string => {
  const codeDigit = 32
  const randomId = random.generateRandomCharacters(codeDigit)

  const formatedDateTime = dayjs(now).tz().format('YYYYMMDDHHmmssSSS')
  const hashId = `${formatedDateTime}-${randomId}`

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
  async (storeId: string, userId: string): Promise<void> => {
    const userDoc = await firestore
      .doc(`/users/${userId}`)
      .withConverter(userConverter)
      .get()
    const userData = userDoc.data()
    if (!userData) {
      throw new functions.https.HttpsError('not-found', 'user')
    }

    await firestore
      .doc(`stores/${storeId}/_users/${userId}`)
      .withConverter(userConverter)
      .set(userData)
  }

export default {
  createTicketAsync,
  createTicketForAdminAsync,
  updateTicketUsedStatusAsync,
  updateTicketUserDataAsync
}
