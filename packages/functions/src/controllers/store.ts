import * as functions from 'firebase-functions'
import { type SockbaseTicketAddedResult, type SockbaseTicket, type SockbaseTicketDocument } from 'sockbase'
import firebaseAdmin from '../libs/FirebaseAdmin'
import { storeConverter, ticketConverter } from '../libs/converters'
import { MD5, enc } from 'crypto-js'
import dayjs from '../helpers/dayjs'
import { createPayment, generateBankTransferCode } from '../services/payment'
import { sendMessageToDiscord } from '../libs/sendWebhook'

export const createTicket = functions.https.onCall(
  async (ticket: SockbaseTicket, context): Promise<SockbaseTicketAddedResult> => {
    const now = new Date()
    const timestamp = now.getTime()

    if (!context.auth) {
      throw new functions.https.HttpsError('permission-denied', 'Auth Error')
    }

    const userId = context.auth.uid
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
    else if (store.schedules.startApplication <= timestamp && timestamp < store.schedules.endApplication) {
      throw new functions.https.HttpsError('deadline-exceeded', 'store_out_of_term')
    }

    const ticketDoc: SockbaseTicketDocument = {
      ...ticket,
      userId,
      createdAt: now,
      updatedAt: null,
      hashId: null
    }

    const ticketResult = await firestore
      .collection('_tickets')
      .withConverter(ticketConverter)
      .add(ticketDoc)
    const ticketId = ticketResult.id

    await firestore
      .doc(`_tickets/${ticketId}/private/meta`)
      .set({ applicationStatus: 0 })

    const typeInfo = store.types
      .filter(t => t.id === ticket.typeId)[0]
    const bankTransferCode = generateBankTransferCode(now)

    const paymentId = typeInfo.productInfo
      ? await createPayment(
        userId,
        ticket.paymentMethod === 'online' ? 1 : 2,
        bankTransferCode,
        typeInfo.productInfo.productId,
        typeInfo.price,
        'ticket',
        ticketId
      )
      : null

    const hashId = generateHashId(storeId, ticketId, now)
    await firestore
      .doc(`_tickets/${ticketId}`)
      .set({ hashId }, { merge: true })

    await firestore
      .doc(`_ticketHashIds/${hashId}`)
      .set({
        hashId,
        ticketId,
        paymentId
      }, { merge: true })

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
              value: typeInfo.name
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
  })

const generateHashId = (storeId: string, refId: string, now: Date): string => {
  const salt = 'sockbase-516koharurikka-broccoli'
  const codeDigit = 32
  const refHashId = MD5(`${storeId}.${refId}.${salt}`)
    .toString(enc.Hex)
    .slice(0, codeDigit)

  const formatedDateTime = dayjs(now).tz().format('YYYYMMDDHHmmssSSS')
  const hashId = `${formatedDateTime}-${refHashId}`

  return hashId
}
