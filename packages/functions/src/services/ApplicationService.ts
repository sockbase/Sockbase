import { MD5, enc } from 'crypto-js'
import dayjs from '../helpers/dayjs'

import type {
  PaymentMethod,
  SockbaseAccount,
  SockbaseApplication,
  SockbaseApplicationAddedResult,
  SockbaseApplicationDocument,
  SockbaseEvent,
  SockbasePaymentDocument
} from 'sockbase'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import * as functions from 'firebase-functions'

import firebaseAdmin from '../libs/FirebaseAdmin'
import { applicationConverter, applicationHashIdConverter, paymentConverter } from '../libs/converters'

import { sendMessageToDiscord } from '../libs/sendWebhook'

export const onChangeApplication = functions.firestore
  .document('/_applications/{applicationId}')
  .onUpdate(async (change: functions.Change<QueryDocumentSnapshot>, context: functions.EventContext<{ applicationId: string }>) => {
    if (!change.after.exists) return

    const adminApp = firebaseAdmin.getFirebaseAdmin()
    const firestore = adminApp.firestore()

    const app = change.after.data() as SockbaseApplicationDocument

    const userDoc = await firestore
      .doc(`/users/${app.userId}`)
      .get()
    if (!userDoc.exists) return

    const userData = userDoc.data() as SockbaseAccount
    await firestore
      .doc(`/events/${app.eventId}/_users/${app.userId}`)
      .set(userData)
  })

export const createApplication = functions.https.onCall(async (app: SockbaseApplication, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('permission-denied', 'Auth Error')
  }

  const userId = context.auth.uid

  const adminApp = firebaseAdmin.getFirebaseAdmin()
  const firestore = adminApp.firestore()

  const existsAppsDoc = await firestore.collection('_applications')
    .withConverter(applicationConverter)
    .where('userId', '==', userId)
    .get()
  const existsApps = existsAppsDoc.docs.length !== 0
  if (existsApps) {
    throw new functions.https.HttpsError('already-exists', 'application_already_exists')
  }

  const unionAppHashDoc = app.unionCircleId
    ? (await firestore.doc(`/_applicationHashIds/${app.unionCircleId}`)
      .withConverter(applicationHashIdConverter)
      .get()).data()
    : null
  if (unionAppHashDoc === undefined) {
    throw new functions.https.HttpsError('not-found', 'application_invalid_unionCircleId')
  }

  if (unionAppHashDoc !== null) {
    const unionApp = (await firestore.doc(`/_applications/${unionAppHashDoc.applicationId}`)
      .withConverter(applicationConverter)
      .get())
      .data()

    if (unionApp?.hashId) {
      throw new functions.https.HttpsError('already-exists', 'application_already_union')
    }
  }

  const eventId = app.eventId

  const eventDoc = await firestore
    .doc(`/events/${eventId}`)
    .get()
  const event = eventDoc.data() as SockbaseEvent | undefined
  if (!event) {
    throw new functions.https.HttpsError('not-found', 'Event')
  }

  const now = new Date()
  const timestamp = now.getTime()

  if (event.schedules.startApplication > timestamp || timestamp > event.schedules.endApplication) {
    throw new functions.https.HttpsError('deadline-exceeded', 'application_out_of_term')
  }

  const appDoc: SockbaseApplicationDocument = {
    ...app,
    userId,
    createdAt: now,
    updatedAt: null,
    hashId: null
  }

  const addResult = await firestore
    .collection('_applications')
    .withConverter(applicationConverter)
    .add(appDoc)
  const appId = addResult.id

  await firestore
    .doc(`/_applications/${appId}/private/meta`)
    .set({ applicationStatus: 0 })

  const space = event.spaces
    .filter(s => s.id === app.spaceId)[0]

  const bankTransferCode = generateBankTransferCode(now)
  const paymentId = space.productInfo
    ? await createPayment(
      userId,
      app.paymentMethod === 'online' ? 1 : 2,
      bankTransferCode,
      space.productInfo.productId,
      space.price,
      'circle',
      appId
    )
    : null

  const hashId = await generateHashId(eventId, appId, now)
  await firestore
    .doc(`/_applications/${appId}`)
    .set(
      { hashId },
      { merge: true }
    )
  await firestore
    .doc(`/_applicationHashIds/${hashId}`)
    .set(
      {
        hashId,
        applicationId: appId,
        paymentId
      },
      { merge: true }
    )

  if (unionAppHashDoc !== null) {
    await firestore
      .doc(`/_applications/${unionAppHashDoc.applicationId}`)
      .set({ unionCircleId: hashId }, { merge: true })
  }

  const webhookBody = {
    content: '',
    username: `Sockbase: ${event.eventName}`,
    embeds: [
      {
        title: 'サークル申し込みを受け付けました！',
        url: '',
        color: 65280,
        fields: [
          {
            name: 'イベント名',
            value: event.eventName
          },
          {
            name: 'サークル名',
            value: app.circle.name
          },
          {
            name: '申し込みハッシュID',
            value: hashId
          }
        ]
      }
    ]
  }
  await sendMessageToDiscord(event._organization.id, webhookBody)

  const result: SockbaseApplicationAddedResult = {
    hashId,
    bankTransferCode
  }
  return result
})

const generateHashId: (eventId: string, refId: string, now: Date) => Promise<string> =
  async (eventId, refId, now) => {
    const salt = 'sockbase-yogurt-koharurikka516'
    const codeDigit = 8
    const refHashId = MD5(`${eventId}.${refId}.${salt}`)
      .toString(enc.Hex)
      .slice(0, codeDigit)
    const formatedDateTime = dayjs(now).tz().format('YYYYMMDDHHmmssSSS')
    const hashId = `${formatedDateTime}-${refHashId}`

    return hashId
  }

const generateBankTransferCode: (now: Date) => string =
  (now) => dayjs(now).tz().format('DDHHmm')

const createPayment: (
  userId: string,
  paymentMethod: PaymentMethod,
  bankTransferCode: string,
  paymentProductId: string,
  paymentAmount: number,
  targetType: 'circle' | 'ticket',
  targetId: string
) => Promise<string> =
  async (
    userId,
    paymentMethod,
    bankTransferCode,
    paymentProductId,
    paymentAmount,
    targetType,
    targetId
  ) => {
    const now = new Date()

    const payment: SockbasePaymentDocument = {
      userId,
      paymentProductId,
      paymentAmount,
      paymentMethod,
      bankTransferCode,
      applicationId: targetType === 'circle' ? targetId : null,
      ticketId: targetType === 'ticket' ? targetId : null,
      createdAt: now,
      updatedAt: null,
      id: '',
      paymentId: '',
      status: 0
    }

    const adminApp = firebaseAdmin.getFirebaseAdmin()
    const firestore = adminApp.firestore()

    const result = await firestore
      .collection('_payments')
      .withConverter(paymentConverter)
      .add(payment)

    return result.id
  }
