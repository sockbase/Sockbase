import { type QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { type Change, firestore, https } from 'firebase-functions/v1'
import {
  type SockbaseSendMailForEventPayload,
  type SockbaseApplicationDocument,
  type SockbaseInquiryDocument,
  type SockbasePaymentDocument,
  type SockbaseTicketDocument
} from 'sockbase'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { eventConverter } from '../libs/converters'
import MailService from '../services/MailService'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const FirestoreDB = adminApp.firestore()

export const acceptApplication = firestore
  .document('/_applications/{applicationId}')
  .onUpdate(async (change: Change<QueryDocumentSnapshot>) => {
    if (!change.before.exists || !change.after.exists) return

    const beforeApp = change.before.data() as SockbaseApplicationDocument
    const afterApp = change.after.data() as SockbaseApplicationDocument

    if (beforeApp.hashId || beforeApp.hashId === afterApp.hashId) return

    await MailService.sendMailAcceptCircleApplicationAsync(afterApp)
  })

export const acceptTicket = firestore
  .document('/_tickets/{ticketId}')
  .onUpdate(async (change: Change<QueryDocumentSnapshot>) => {
    if (!change.before.exists || !change.after.exists) return

    const beforeTicket = change.before.data() as SockbaseTicketDocument
    const afterTicket = change.after.data() as SockbaseTicketDocument

    if (beforeTicket.hashId || beforeTicket.hashId === afterTicket.hashId) return

    await MailService.sendMailAcceptTicketAsync(afterTicket)
  })

export const onUpdateApplication = firestore
  .document('/_applications/{applicationId}')
  .onUpdate(async (change: Change<QueryDocumentSnapshot>) => {
    if (!change.after.exists) return

    const beforeApp = change.before.data() as SockbaseApplicationDocument
    const afterApp = change.after.data() as SockbaseApplicationDocument
    if (beforeApp.unionCircleId || !afterApp.unionCircleId) {
      return
    }

    await MailService.sendMailUpdateUnionCircleAsync(afterApp)
  })

export const requestPayment = firestore
  .document('/_payments/{paymentId}')
  .onCreate(async (snapshot: QueryDocumentSnapshot) => {
    const payment = snapshot.data() as SockbasePaymentDocument
    await MailService.sendMailRequestPaymentAsync(payment)
  })

export const acceptPayment = firestore
  .document('/_payments/{paymentId}')
  .onUpdate(async (change: Change<QueryDocumentSnapshot>) => {
    if (!change.after) return

    const payment = change.after.data() as SockbasePaymentDocument
    await MailService.sendMailAcceptPaymentAsync(payment)
  })

export const acceptInquiry = firestore
  .document('/_inquiries/{inquiryId}')
  .onCreate(async (snapshot: QueryDocumentSnapshot) => {
    const inquiry = snapshot.data() as SockbaseInquiryDocument

    await MailService.sendMailAcceptInquiryAsync(inquiry)
  })

export const sendMailManuallyForEvent = https.onCall(
  async (payload: SockbaseSendMailForEventPayload, context): Promise<boolean> => {
    if (!context.auth?.token.roles) {
      throw new https.HttpsError('permission-denied', 'Auth Error')
    }

    const eventDoc = await FirestoreDB
      .doc(`events/${payload.eventId}`)
      .withConverter(eventConverter)
      .get()
    const event = eventDoc.data()
    if (!event) {
      throw new https.HttpsError('not-found', 'event')
    } else if (context.auth.token.roles?.[event._organization.id] < 2) {
      throw new https.HttpsError('permission-denied', 'Auth Error')
    }

    const result = await MailService.sendMailManuallyForEventAsync(payload)
    return result
  })
