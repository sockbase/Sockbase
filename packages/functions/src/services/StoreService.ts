import * as functions from 'firebase-functions'
import {
  type SockbaseTicketDocument,
  type SockbaseTicket,
  type SockbaseTicketAddedResult,
  type SockbaseTicketCreatedResult
} from 'sockbase'
import firebaseAdmin from '../libs/FirebaseAdmin'
import { createPayment, generateBankTransferCode } from '../services/payment'
import { storeConverter, ticketConverter } from '../libs/converters'
import { sendMessageToDiscord } from '../libs/sendWebhook'
import dayjs from '../helpers/dayjs'
import random from '../helpers/random'

export const createTicketAsync = async (userId: string, ticket: SockbaseTicket): Promise<SockbaseTicketAddedResult> => {
  const now = new Date()
  const timestamp = now.getTime()

  const storeId = ticket.storeId

  const adminApp = firebaseAdmin.getFirebaseAdmin()
  const firestore = adminApp.firestore()

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

  const hashId = generateTicketHashId(now)
  const ticketDoc: SockbaseTicketDocument = {
    ...ticket,
    userId,
    createdAt: now,
    updatedAt: null,
    hashId,
    createdUserId: null
  }

  const ticketResult = await firestore
    .collection('_tickets')
    .withConverter(ticketConverter)
    .add(ticketDoc)
  const ticketId = ticketResult.id

  await firestore
    .doc(`_tickets/${ticketId}/private/meta`)
    .set({ applicationStatus: 0 })

  await firestore
    .doc(`_tickets/${ticketId}/private/usedStatus`)
    .set({
      used: false,
      usedAt: null
    })

  const type = store.types
    .filter(t => t.id === ticket.typeId)[0]

  const bankTransferCode = generateBankTransferCode(now)

  const paymentId = type.productInfo
    ? await createPayment(
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
    .doc(`_ticketHashIds/${hashId}`)
    .set({
      hashId,
      ticketId,
      paymentId
    })

  await firestore
    .doc(`_ticketUsers/${hashId}`)
    .set({
      userId,
      storeId,
      typeId: ticket.typeId,
      usableUserId: null,
      used: false,
      usedAt: null
    })

  const webhookBody = {
    username: `Sockbase: ${store.storeName}`,
    embeds: [
      {
        title: 'チケット申し込みを受け付けました！',
        url: '',
        color: 65280,
        fields: [
          {
            name: 'チケットストア名',
            value: store.storeName
          },
          {
            name: '種類',
            value: type.name
          }
        ]
      }
    ]
  }

  sendMessageToDiscord(store._organization.id, webhookBody)
    .then(() => console.log('sent webhook'))
    .catch(err => { throw err })

  const result: SockbaseTicketAddedResult = {
    hashId,
    bankTransferCode
  }

  return result
}

const generateTicketHashId = (now: Date): string => {
  const codeDigit = 32
  const randomId = random.generateRandomCharacters(codeDigit)

  const formatedDateTime = dayjs(now).tz().format('YYYYMMDDHHmmssSSS')
  const hashId = `${formatedDateTime}-${randomId}`

  return hashId
}

export const createTicketForAdminAsync = async (userId: string, storeId: string, typeId: string, email: string): Promise<SockbaseTicketCreatedResult> => {
  const now = new Date()

  const adminApp = firebaseAdmin.getFirebaseAdmin()
  const auth = adminApp.auth()
  const firestore = adminApp.firestore()

  const storeDoc = await firestore.doc(`stores/${storeId}`)
    .withConverter(storeConverter)
    .get()
  const store = storeDoc.data()
  if (!store) {
    throw new functions.https.HttpsError('not-found', 'store')
  }

  const user = await auth
    .getUserByEmail(email)
    .catch(err => { throw err })

  const hashId = generateTicketHashId(now)
  const ticketDoc: SockbaseTicketDocument = {
    storeId,
    typeId,
    paymentMethod: 'online',
    userId: user.uid,
    createdAt: now,
    updatedAt: null,
    hashId,
    createdUserId: userId
  }

  const ticketResult = await firestore
    .collection('_tickets')
    .withConverter(ticketConverter)
    .add(ticketDoc)

  const ticketId = ticketResult.id

  await firestore
    .doc(`_tickets/${ticketId}/private/meta`)
    .set({ applicationStatus: 2 })

  await firestore
    .doc(`_tickets/${ticketId}/private/usedStatus`)
    .set({
      used: false,
      usedAt: null
    })

  await firestore
    .doc(`_ticketHashIds/${hashId}`)
    .set({
      hashId,
      ticketId,
      paymentId: null
    })

  await firestore
    .doc(`_ticketUsers/${hashId}`)
    .set({
      userId: user.uid,
      storeId,
      typeId,
      usableUserId: null,
      used: false,
      usedAt: null
    })

  return {
    ...ticketDoc,
    id: ticketId,
    createdAt: ticketDoc.createdAt?.getTime() ?? 0,
    email: user.email ?? ''
  }
}
