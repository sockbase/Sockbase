import { type UserRecord, getAuth } from 'firebase-admin/auth'
import type { SockbaseApplicationDocument, SockbaseInquiryDocument, SockbasePaymentDocument, SockbaseTicketDocument } from 'sockbase'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import * as functions from 'firebase-functions'

import mailConfig from '../configs/mail'
import { applicationConverter, applicationHashIdConverter, eventConverter, storeConverter, ticketConverter } from '../libs/converters'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { getUserDataAsync } from '../models/user'

const getUser: (userId: string) => Promise<UserRecord> =
  async (userId) => {
    const adminApp = FirebaseAdmin.getFirebaseAdmin()
    const auth = getAuth(adminApp)
    const user = await auth.getUser(userId)
    return user
  }

export const acceptApplication = functions.firestore
  .document('/_applications/{applicationId}')
  .onCreate(async (snapshot: QueryDocumentSnapshot, context: functions.EventContext<{ applicationId: string }>) => {
    const adminApp = FirebaseAdmin.getFirebaseAdmin()
    const firestore = adminApp.firestore()

    const app = snapshot.data() as SockbaseApplicationDocument
    const user = await getUser(app.userId)

    const eventDoc = await firestore
      .doc(`/events/${app.eventId}`)
      .withConverter(eventConverter)
      .get()
    const event = eventDoc.data()
    if (!event) {
      throw new Error('event not found')
    }

    const space = event.spaces
      .filter(s => s.id === app.spaceId)[0]

    const template = mailConfig.templates.acceptApplication(event, app, space)
    await firestore.collection('_mails')
      .add({
        to: user.email,
        message: {
          subject: template.subject,
          text: template.body.join('\n')
        }
      })
  })

export const acceptTicket = functions.firestore
  .document('/_tickets/{ticketId}')
  .onCreate(async (snapshot: QueryDocumentSnapshot) => {
    const adminApp = FirebaseAdmin.getFirebaseAdmin()
    const firestore = adminApp.firestore()

    const ticket = snapshot.data() as SockbaseTicketDocument
    const user = await getUser(ticket.userId)

    const storeDoc = await firestore.doc(`/stores/${ticket.storeId}`)
      .withConverter(storeConverter)
      .get()
    const store = storeDoc.data()
    if (!store) {
      throw new Error('store not found')
    }

    const type = store.types
      .filter(t => t.id === ticket.typeId)[0]

    const template = mailConfig.templates.acceptTicket(store, type, ticket)
    await firestore.collection('_mails')
      .add({
        to: user.email,
        message: {
          subject: template.subject,
          text: template.body.join('\n')
        }
      })
  })

export const onUpdateApplication = functions.firestore
  .document('/_applications/{applicationId}')
  .onUpdate(async (change: functions.Change<QueryDocumentSnapshot>, context: functions.EventContext<{ applicationId: string }>) => {
    if (!change.after.exists) return

    const beforeApp = change.before.data() as SockbaseApplicationDocument
    const afterApp = change.after.data() as SockbaseApplicationDocument

    const adminApp = FirebaseAdmin.getFirebaseAdmin()
    const firestore = adminApp.firestore()

    if (!beforeApp.unionCircleId && afterApp.unionCircleId) {
      const unionCircleAppHashDoc = await firestore.doc(`/_applicationHashIds/${afterApp.unionCircleId}`)
        .withConverter(applicationHashIdConverter)
        .get()
      const unionCircleAppHash = unionCircleAppHashDoc.data()
      if (!unionCircleAppHash) {
        throw new Error('unionAppHash not found')
      }

      const unionCircleAppDoc = await firestore.doc(`/_applications/${unionCircleAppHash.applicationId}`)
        .withConverter(applicationConverter)
        .get()
      const unionCircleApp = unionCircleAppDoc.data()
      if (!unionCircleApp) {
        throw new Error(`unionApp not found (${unionCircleAppHash.applicationId})`)
      }

      const unionUser = await getUser(unionCircleApp.userId)

      const eventDoc = await firestore.doc(`/events/${afterApp.eventId}`)
        .withConverter(eventConverter)
        .get()
      const event = eventDoc.data()
      if (!event) {
        throw new Error('event not found')
      }

      const updateUnionCircleTemplate = mailConfig.templates.updateUnionCircle(event, afterApp, unionCircleApp)
      await firestore.collection('_mails')
        .add({
          to: unionUser.email,
          message: {
            subject: updateUnionCircleTemplate.subject,
            text: updateUnionCircleTemplate.body.join('\n')
          }
        })
    }
  })

export const requestPayment = functions.firestore
  .document('/_payments/{paymentId}')
  .onCreate(async (snapshot: QueryDocumentSnapshot, context: functions.EventContext<{ paymentId: string }>) => {
    const adminApp = FirebaseAdmin.getFirebaseAdmin()
    const firestore = adminApp.firestore()

    const payment = snapshot.data() as SockbasePaymentDocument
    const user = await getUser(payment.userId)

    if (!user.email) {
      throw new Error('invalid email')
    }

    const template = payment.applicationId
      ? await requestCirclePaymentAsync(payment.applicationId, payment, user.email)
      : payment.ticketId
        ? await requestTicketPaymentAsync(payment.ticketId, payment, user.email)
        : null

    if (!template) return

    await firestore.collection('_mails')
      .add({
        to: user.email,
        message: {
          subject: template.subject,
          text: template.body.join('\n')
        }
      })
  })

export const acceptPayment = functions.firestore
  .document('/_payments/{paymentId}')
  .onUpdate(async (change: functions.Change<QueryDocumentSnapshot>, context: functions.EventContext<{ paymentId: string }>) => {
    if (!change.after) return

    const adminApp = FirebaseAdmin.getFirebaseAdmin()
    const firestore = adminApp.firestore()

    const payment = change.after.data() as SockbasePaymentDocument

    const user = await getUser(payment.userId)

    if (payment.status !== 1) return

    const template = payment.applicationId
      ? await acceptCirclePaymentAsync(payment.applicationId, payment)
      : payment.ticketId
        ? await acceptTicketPaymentAsync(payment.ticketId, payment)
        : null

    if (!template) return

    await firestore.collection('_mails')
      .add({
        to: user.email,
        message: {
          subject: template.subject,
          text: template.body.join('\n')
        }
      })
  })

export const acceptInquiry = functions.firestore
  .document('/_inquiries/{inquiryId}')
  .onCreate(async (snapshot: QueryDocumentSnapshot) => {
    const inquiry = snapshot.data() as SockbaseInquiryDocument

    const adminApp = FirebaseAdmin.getFirebaseAdmin()
    const firestore = adminApp.firestore()

    const user = await getUser(inquiry.userId)
    const userData = await getUserDataAsync(user.uid)

    const template = mailConfig.templates.acceptInquiry(inquiry, userData)
    await firestore.collection('_mails')
      .add({
        to: user.email,
        message: {
          subject: template.subject,
          text: template.body.join('\n')
        }
      })
  })

const requestCirclePaymentAsync =
  async (appId: string, payment: SockbasePaymentDocument, email: string): Promise<{ subject: string, body: string[] }> => {
    const adminApp = FirebaseAdmin.getFirebaseAdmin()
    const firestore = adminApp.firestore()

    const appDoc = await firestore
      .doc(`/_applications/${appId}`)
      .withConverter(applicationConverter)
      .get()
    const app = appDoc.data()
    if (!app) {
      throw new Error('application not found')
    }

    const eventDoc = await firestore
      .doc(`/events/${app.eventId}`)
      .withConverter(eventConverter)
      .get()
    const event = eventDoc.data()
    if (!event) {
      throw new Error('event not found')
    }

    const space = event.spaces
      .filter(s => s.id === app.spaceId)[0]

    return mailConfig.templates.requestCirclePayment(payment, app, event, space, email)
  }

const acceptCirclePaymentAsync =
  async (appId: string, payment: SockbasePaymentDocument): Promise<{ subject: string; body: string[] }> => {
    const adminApp = FirebaseAdmin.getFirebaseAdmin()
    const firestore = adminApp.firestore()

    const appDoc = await firestore.doc(`/_applications/${appId}`)
      .withConverter(applicationConverter)
      .get()
    const app = appDoc.data()
    if (!app) {
      throw new Error('application not found')
    }

    const eventDoc = await firestore.doc(`/events/${app.eventId}`)
      .withConverter(eventConverter)
      .get()
    const event = eventDoc.data()
    if (!event) {
      throw new Error('event not found')
    }

    const space = event.spaces
      .filter(s => s.id === app.spaceId)[0]

    return mailConfig.templates.acceptCirclePayment(payment, app, event, space)
  }

const requestTicketPaymentAsync =
  async (ticketId: string, payment: SockbasePaymentDocument, email: string): Promise<{ subject: string; body: string[] }> => {
    const adminApp = FirebaseAdmin.getFirebaseAdmin()
    const firestore = adminApp.firestore()

    const ticketDoc = await firestore.doc(`/_tickets/${ticketId}`)
      .withConverter(ticketConverter)
      .get()
    const ticket = ticketDoc.data()
    if (!ticket) {
      throw new Error('ticket not found')
    }

    const storeDoc = await firestore.doc(`/stores/${ticket.storeId}`)
      .withConverter(storeConverter)
      .get()
    const store = storeDoc.data()
    if (!store) {
      throw new Error('store not found')
    }

    const type = store.types
      .filter(t => t.id === ticket.typeId)[0]

    return mailConfig.templates.requestTicketPayment(payment, ticket, store, type, email)
  }

const acceptTicketPaymentAsync =
  async (ticketId: string, payment: SockbasePaymentDocument): Promise<{ subject: string; body: string[] }> => {
    const adminApp = FirebaseAdmin.getFirebaseAdmin()
    const firestore = adminApp.firestore()

    const ticketDoc = await firestore.doc(`/_tickets/${ticketId}`)
      .withConverter(ticketConverter)
      .get()
    const ticket = ticketDoc.data()
    if (!ticket) {
      throw new Error('ticket not found')
    }

    const storeDoc = await firestore.doc(`/stores/${ticket.storeId}`)
      .withConverter(storeConverter)
      .get()
    const store = storeDoc.data()
    if (!store) {
      throw new Error('store not found')
    }

    const type = store.types
      .filter(t => t.id === ticket.typeId)[0]

    return mailConfig.templates.acceptTicketPayment(payment, store, type, ticket)
  }
