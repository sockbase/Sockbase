import { type QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { type Change, type EventContext, firestore } from 'firebase-functions'
import {
  type SockbaseApplicationDocument,
  type SockbaseInquiryDocument,
  type SockbasePaymentDocument,
  type SockbaseTicketDocument
} from 'sockbase'

import MailService from '../services/MailService'

export const acceptApplication = firestore
  .document('/_applications/{applicationId}')
  .onCreate(async (snapshot: QueryDocumentSnapshot) => {
    const app = snapshot.data() as SockbaseApplicationDocument
    await MailService.sendMailAcceptCircleApplicationAsync(app)
  })

export const acceptTicket = firestore
  .document('/_tickets/{ticketId}')
  .onCreate(async (snapshot: QueryDocumentSnapshot) => {
    const ticket = snapshot.data() as SockbaseTicketDocument
    await MailService.sendMailAcceptTicketAsync(ticket)
  })

export const onUpdateApplication = firestore
  .document('/_applications/{applicationId}')
  .onUpdate(async (change: Change<QueryDocumentSnapshot>, context: EventContext<{ applicationId: string }>) => {
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
  .onCreate(async (snapshot: QueryDocumentSnapshot, context: EventContext<{ paymentId: string }>) => {
    const payment = snapshot.data() as SockbasePaymentDocument
    await MailService.sendMailRequestPaymentAsync(payment)
  })

export const acceptPayment = firestore
  .document('/_payments/{paymentId}')
  .onUpdate(async (change: Change<QueryDocumentSnapshot>, context: EventContext<{ paymentId: string }>) => {
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
