import { type FirebaseError } from 'firebase-admin'
import { https } from 'firebase-functions'
import dayjs from '../helpers/dayjs'
import { generateRandomCharacters } from '../helpers/random'
import { calculatePaymentAmount } from '../helpers/voucher'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { storeConverter, ticketConverter, ticketUserConverter, userConverter } from '../libs/converters'
import { sendMessageToDiscord } from '../libs/sendWebhook'
import { createCheckoutSessionAsync } from './CheckoutService'
import { generateBankTransferCode } from './PaymentService'
import { getVoucherAsync, useVoucherAsync } from './VoucherService'
import type {
  SockbaseTicketDocument,
  SockbaseTicketCreateResult,
  SockbaseAdminTicketCreateResult,
  SockbaseTicketUsedStatus,
  SockbaseStoreDocument,
  SockbaseStoreType,
  SockbaseAccountDocument,
  PaymentMethod,
  SockbaseTicketApplyPayload
} from 'sockbase'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()
const auth = adminApp.auth()

const createTicketAsync = async (userId: string, payload: SockbaseTicketApplyPayload): Promise<SockbaseTicketCreateResult> => {
  const now = new Date()
  const timestamp = now.getTime()

  const storeId = payload.ticket.storeId

  const storeDoc = await firestore.doc(`stores/${storeId}`)
    .withConverter(storeConverter)
    .get()
  const store = storeDoc.data()
  if (!store) {
    throw new https.HttpsError('not-found', 'store')
  }
  else if (store.schedules.startApplication >= timestamp || timestamp > store.schedules.endApplication) {
    throw new https.HttpsError('deadline-exceeded', 'store_out_of_term')
  }
  else if (!store.permissions.canUseBankTransfer && payload.ticket.paymentMethod === 'bankTransfer') {
    throw new https.HttpsError('invalid-argument', 'invalid_argument_bankTransfer')
  }

  const type = store.types
    .filter(t => t.isPublic)
    .find(t => t.id === payload.ticket.typeId)
  if (!type) {
    throw new https.HttpsError('not-found', 'type')
  }

  const voucher = payload.voucherId
    ? await getVoucherAsync(payload.voucherId)
    : undefined
  if (voucher === null) {
    throw new https.HttpsError('invalid-argument', 'voucher_not_found')
  }

  const paymentAmount = calculatePaymentAmount(type.price, voucher?.amount)
  if (voucher !== undefined && paymentAmount.paymentAmount > 0 && payload.ticket.paymentMethod === 'voucher') {
    throw new https.HttpsError('invalid-argument', 'voucher_not_usable')
  }

  const useVoucher = voucher
    ? await useVoucherAsync(2, payload.ticket.storeId, payload.ticket.typeId, voucher.id)
    : null
  if (useVoucher === false) {
    throw new https.HttpsError('invalid-argument', 'voucher_not_usable')
  }

  const createdResult = await createTicketCoreAsync(
    userId,
    store,
    type,
    payload.ticket.paymentMethod === 'voucher'
      ? 3
      : payload.ticket.paymentMethod === 'online'
        ? 1
        : 2,
    false,
    paymentAmount.paymentAmount,
    paymentAmount.spaceAmount,
    paymentAmount.voucherAmount ?? 0,
    voucher?.id ?? null,
    now)
  await updateTicketUserDataAsync(userId, store.id)

  if (type.anotherTicket?.storeId && type.anotherTicket?.typeId) {
    const anotherTicketStoreDoc = await firestore.doc(`stores/${type.anotherTicket.storeId}`)
      .withConverter(storeConverter)
      .get()
    const anotherTicketStore = anotherTicketStoreDoc.data()
    if (!anotherTicketStore) {
      throw new https.HttpsError('not-found', 'anotherTicketStore')
    }

    const anotherTicketType = anotherTicketStore.types.filter(t => t.id === type.anotherTicket?.typeId)[0]
    if (!anotherTicketType) {
      throw new https.HttpsError('not-found', 'anotherTicketType')
    }

    await createTicketCoreAsync(
      userId,
      anotherTicketStore,
      anotherTicketType,
      1,
      true,
      0,
      0,
      0,
      null,
      now)
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
    bankTransferCode: createdResult.bankTransferCode,
    checkoutRequest: createdResult.checkoutRequest
  }
}

const createTicketForAdminAsync =
  async (
    createdUserId: string,
    storeId: string,
    typeId: string,
    email: string | null
  ): Promise<SockbaseAdminTicketCreateResult> => {
    const now = new Date()

    const user = email
      ? await auth
        .getUserByEmail(email)
        .catch((err: FirebaseError) => {
          if (err.code === 'auth/user-not-found') {
            throw new https.HttpsError('not-found', 'user_not_found')
          }
          else {
            console.error(err)
            throw new https.HttpsError('internal', 'auth')
          }
        })
      : null

    const storeDoc = await firestore.doc(`stores/${storeId}`)
      .withConverter(storeConverter)
      .get()
    const store = storeDoc.data()
    if (!store) {
      throw new https.HttpsError('not-found', 'store')
    }

    const type = store.types.filter(t => t.id === typeId)[0]
    if (!type) {
      throw new https.HttpsError('not-found', 'type')
    }

    const createdResult = await createTicketCoreAsync(
      user?.uid ?? null,
      store,
      type,
      1,
      false,
      0,
      0,
      0,
      null,
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
        throw new https.HttpsError('not-found', 'anotherTicketStore')
      }

      const anotherTicketType = anotherTicketStore.types.filter(t => t.id === type.anotherTicket?.typeId)[0]
      if (!anotherTicketType) {
        throw new https.HttpsError('not-found', 'anotherTicketType')
      }

      await createTicketCoreAsync(
        user.uid,
        anotherTicketStore,
        anotherTicketType,
        1,
        true,
        0,
        0,
        0,
        null,
        now,
        createdUserId)
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
    paymentAmount: number,
    totalAmount: number,
    voucherAmount: number,
    voucherId: string | null,
    now: Date,
    createdUserId?: string
  ): Promise<SockbaseTicketCreateResult & {
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

    const bankTransferCode = generateBankTransferCode(now)
    const createResult = type.price > 0 && !isAdmin && userId
      ? await createCheckoutSessionAsync({
        now,
        userId: createdUserId ?? userId,
        orgId: store._organization.id,
        paymentMethod,
        paymentAmount,
        totalAmount,
        voucherAmount,
        voucherId,
        bankTransferCode,
        name: `${store.name} - ${type.name}`,
        targetType: 'ticket',
        targetId: ticketId
      })
      : null

    await firestore
      .doc(`/_tickets/${ticketId}/private/usedStatus`)
      .set({
        used: false,
        usedAt: null
      })

    await firestore
      .doc(`/_ticketHashIds/${hashId}`)
      .set({
        hashId,
        ticketId,
        paymentId: createResult?.paymentId ?? null
      })

    await firestore
      .doc(`/_tickets/${ticketId}/private/meta`)
      .set({
        applicationStatus: isAdmin || isStandalone ? 2 : 0
      })

    await firestore
      .doc(`/_ticketUsers/${hashId}`)
      .set({
        userId,
        storeId: store.id,
        typeId: type.id,
        usableUserId: store.permissions.ticketUserAutoAssign ? userId : null,
        used: false,
        usedAt: null,
        isStandalone
      })

    return {
      ticketId,
      ticketDoc,
      hashId,
      bankTransferCode,
      checkoutRequest: createResult?.checkoutRequest ?? null
    }
  }

const generateTicketHashId = (now: Date): string => {
  const codeDigit = 12
  const randomId = generateRandomCharacters(codeDigit, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
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
      throw new https.HttpsError('not-found', 'user')
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
