import {
  type SockbaseTicketDocument,
  type SockbaseApplicationDocument,
  type SockbasePaymentDocument,
  type SockbaseInquiryDocument
} from 'sockbase'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import mailConfig from '../configs/mail'
import { getEventByIdAsync } from '../models/event'
import { getStoreByIdAsync } from '../models/store'
import { getApplicaitonHashIdAsync, getApplicationByIdAsync } from '../models/application'
import { getTicketByIdAsync } from '../models/ticket'
import { getUserDataAsync } from '../models/user'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()
const auth = adminApp.auth()

const sendMailAcceptCircleApplicationAsync = async (app: SockbaseApplicationDocument): Promise<void> => {
  const email = await getEmail(app.userId)
  const event = await getEventByIdAsync(app.eventId)
  const space = event.spaces.filter(s => s.id === app.spaceId)[0]
  const genre = event.genres.filter(g => g.id === app.circle.genre)[0]

  const template = mailConfig.templates.acceptApplication(event, app, space, genre)
  await addQueueAsync(email, template)
}

const sendMailAcceptTicketAsync = async (ticket: SockbaseTicketDocument): Promise<void> => {
  if (ticket.createdUserId) return

  const email = await getEmail(ticket.userId)
  const store = await getStoreByIdAsync(ticket.storeId)
  const type = store.types.filter(t => t.id === ticket.typeId)[0]

  const template = mailConfig.templates.acceptTicket(store, type, ticket)
  await addQueueAsync(email, template)
}

const sendMailUpdateUnionCircleAsync = async (app: SockbaseApplicationDocument): Promise<void> => {
  if (!app.unionCircleId) return

  const unionAppHash = await getApplicaitonHashIdAsync(app.unionCircleId)
  const unionApp = await getApplicationByIdAsync(unionAppHash.applicationId)
  const event = await getEventByIdAsync(unionApp.eventId)
  const unionUserEmail = await getEmail(unionApp.userId)

  const template = mailConfig.templates.updateUnionCircle(event, app, unionApp)
  await addQueueAsync(unionUserEmail, template)
}

const sendMailRequestPaymentAsync = async (payment: SockbasePaymentDocument): Promise<void> => {
  const email = await getEmail(payment.userId)
  const template = payment.applicationId
    ? await requestCirclePaymentAsync(payment, payment.applicationId, email)
    : payment.ticketId
      ? await requestTicketPaymentAsync(payment, payment.ticketId, email)
      : null
  if (!template) return

  await addQueueAsync(email, template)
}

const requestCirclePaymentAsync = async (payment: SockbasePaymentDocument, appId: string, email: string): Promise<{ subject: string, body: string[] }> => {
  const app = await getApplicationByIdAsync(appId)
  const event = await getEventByIdAsync(app.eventId)
  const space = event.spaces.filter(s => s.id === app.spaceId)[0]

  return mailConfig.templates.requestCirclePayment(payment, app, event, space, email)
}

const requestTicketPaymentAsync = async (payment: SockbasePaymentDocument, ticketId: string, email: string): Promise<{ subject: string, body: string[] }> => {
  const ticket = await getTicketByIdAsync(ticketId)
  const store = await getStoreByIdAsync(ticket.storeId)
  const type = store.types.filter(t => t.id === ticket.typeId)[0]

  return mailConfig.templates.requestTicketPayment(payment, ticket, store, type, email)
}

const sendMailAcceptPaymentAsync = async (payment: SockbasePaymentDocument): Promise<void> => {
  if (payment.status !== 1) return

  const email = await getEmail(payment.userId)
  const template = payment.applicationId
    ? await acceptCirclePaymentAsync(payment, payment.applicationId)
    : payment.ticketId
      ? await acceptTicketPaymentAsync(payment, payment.ticketId)
      : null
  if (!template) return

  await addQueueAsync(email, template)
}

const acceptCirclePaymentAsync = async (payment: SockbasePaymentDocument, appId: string): Promise<{ subject: string, body: string[] }> => {
  const app = await getApplicationByIdAsync(appId)
  const event = await getEventByIdAsync(app.eventId)
  const space = event.spaces.filter(s => s.id === app.spaceId)[0]

  return mailConfig.templates.acceptCirclePayment(payment, app, event, space)
}

const acceptTicketPaymentAsync = async (payment: SockbasePaymentDocument, ticketId: string): Promise<{ subject: string, body: string[] }> => {
  const ticket = await getTicketByIdAsync(ticketId)
  const store = await getStoreByIdAsync(ticket.storeId)
  const type = store.types.filter(t => t.id === ticket.typeId)[0]

  return mailConfig.templates.acceptTicketPayment(payment, store, type, ticket)
}

const sendMailAcceptInquiryAsync = async (inquiry: SockbaseInquiryDocument): Promise<void> => {
  const email = await getEmail(inquiry.userId)
  const userData = await getUserDataAsync(inquiry.userId)

  const template = mailConfig.templates.acceptInquiry(inquiry, userData)
  await addQueueAsync(email, template)
}

const getEmail = async (userId: string): Promise<string> => {
  const user = await auth.getUser(userId)
  if (!user.email) {
    throw new Error('email no set')
  }
  return user.email
}

const addQueueAsync = async (email: string, content: { subject: string, body: string[] }): Promise<void> => {
  await firestore.collection('_mails')
    .add({
      to: email,
      message: {
        subject: content.subject,
        text: content.body.join('\n')
      }
    })
}

export default {
  sendMailAcceptCircleApplicationAsync,
  sendMailAcceptTicketAsync,
  sendMailUpdateUnionCircleAsync,
  sendMailRequestPaymentAsync,
  sendMailAcceptPaymentAsync,
  sendMailAcceptInquiryAsync
}
