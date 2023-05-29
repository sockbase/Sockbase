import { type UserRecord, getAuth } from 'firebase-admin/auth'
import type { SockbaseApplicationDocument, SockbaseInquiryDocument, SockbasePaymentDocument } from 'sockbase'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import * as functions from 'firebase-functions'

import mailConfig from '../configs/mail'
import { applicationConverter, applicationHashIdConverter, eventConverter } from '../libs/converters'
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

    if (!payment.applicationId) return

    const template = await requestCirclePaymentAsync(payment.applicationId, payment)
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
    if (!payment.applicationId) return

    const appDoc = await firestore.doc(`/_applications/${payment.applicationId}`)
      .withConverter(applicationConverter)
      .get()
    const app = appDoc.data()
    if (!app) return

    const eventDoc = await firestore.doc(`/events/${app.eventId}`)
      .withConverter(eventConverter)
      .get()
    const event = eventDoc.data()
    if (!event) return

    const space = event.spaces
      .filter(s => s.id === app.spaceId)[0]

    const template = mailConfig.templates.acceptCirclePayment(payment, app, event, space)
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
  async (appId: string, payment: SockbasePaymentDocument): Promise<{ subject: string, body: string[] }> => {
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

    return mailConfig.templates.requestCirclePayment(payment, app, event, space)
  }

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
