import { MD5, enc } from 'crypto-js'
import dayjs from '../helpers/dayjs'

import type {
  PaymentMethod,
  SockbaseAccount,
  SockbaseApplication,
  SockbaseApplicationAddedResult,
  SockbaseApplicationDocument,
  SockbaseEvent,
  SockbaseOrganizationWithMeta,
  SockbasePaymentDocument
} from 'sockbase'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import * as functions from 'firebase-functions'

import fetch from 'node-fetch'

import firebaseAdmin from '../libs/FirebaseAdmin'
import { applicationConverter, paymentConverter } from '../libs/converters'

export const onChangeApplication = functions.firestore
  .document('/applications/{applicationId}')
  .onUpdate(async (change: functions.Change<QueryDocumentSnapshot>, context: functions.EventContext<{ applicationId: string }>) => {
    if (!change.after.exists) return

    const adminApp = firebaseAdmin.getFirebaseAdmin()
    const firestore = adminApp.firestore()

    const appId = change.after.id
    const app = change.after.data() as SockbaseApplicationDocument
    if (!app.hashId) return

    const userDoc = await firestore
      .doc(`/users/${app.userId}`)
      .get()
    const user = userDoc.data() as SockbaseAccount

    await firestore
      .doc(`/_applicationHashIds/${app.hashId}`)
      .set({
        applicationId: appId,
        hashId: app.hashId
      })

    await firestore
      .doc(`/events/${app.eventId}/_users/${app.userId}`)
      .set(user)
  })

export const createApplication = functions.https.onCall(async (app: SockbaseApplication, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('permission-denied', 'Auth Error')
  }

  const userId = context.auth.uid

  const adminApp = firebaseAdmin.getFirebaseAdmin()
  const firestore = adminApp.firestore()

  const eventId = app.eventId
  const eventDoc = await firestore
    .doc(`/events/${eventId}`)
    .get()
  const event = eventDoc.data() as SockbaseEvent | undefined
  if (!event) {
    throw new functions.https.HttpsError('not-found', 'Event')
  }

  const appDoc: SockbaseApplicationDocument = {
    ...app,
    userId,
    timestamp: 0,
    hashId: null
  }

  const addResult = await firestore
    .collection('applications')
    .withConverter(applicationConverter)
    .add(appDoc)
  const appId = addResult.id

  const hashId = await generateHashId(eventId, appId)
  await firestore
    .doc(`/applications/${appId}`)
    .set(
      { hashId },
      { merge: true }
    )

  await firestore
    .doc(`/applications/${appId}/private/meta`)
    .set({ applicationStatus: 0 })

  const space = event.spaces
    .filter(s => s.id === app.spaceId)[0]

  const bankTransferCode = generateBankTransferCode()
  if (space.paymentProductId) {
    await createPayment(
      userId,
      app.paymentMethod === 'online' ? 1 : 2,
      bankTransferCode,
      space.paymentProductId,
      space.price,
      'circle',
      appId
    )
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
            name: '申し込みID',
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

const sendMessageToDiscord: (organizationId: string, messageBody: {
  content: string
  username: string
  embeds: Array<{
    title: string
    url: string
    color: number
    fields: Array<{
      name: string
      value: string
    }>
  }>
}) => Promise<void> =
  async (organizationId, messageBody) => {
    const adminApp = firebaseAdmin.getFirebaseAdmin()
    const organizationDoc = await adminApp.firestore()
      .doc(`/organizations/${organizationId}`)
      .get()
    const organization = organizationDoc.data() as SockbaseOrganizationWithMeta

    await fetch(organization.config.discordWebhookURL, {
      method: 'POST',
      body: JSON.stringify(messageBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

const generateHashId: (eventId: string, refId: string) => Promise<string> =
  async (eventId, refId) => {
    const salt = 'sockbase-yogurt-koharurikka516'
    const codeDigit = 8
    const refHashId = MD5(`${eventId}.${refId}.${salt}`)
      .toString(enc.Hex)
      .slice(0, codeDigit)
    const formatedDateTime = dayjs().tz().format('YYYYMMDDHmmssSSS')
    const hashId = `${formatedDateTime}-${refHashId}`

    return hashId
  }

const generateBankTransferCode: () => string =
  () => dayjs().tz().format('DDHHmm')

const createPayment: (
  userId: string,
  paymentMethod: PaymentMethod,
  bankTransferCode: string,
  paymentProductId: string,
  paymentAmount: number,
  targetType: 'circle' | 'ticket',
  targetId: string
) => Promise<void> =
  async (
    userId,
    paymentMethod,
    bankTransferCode,
    paymentProductId,
    paymentAmount,
    targetType,
    targetId
  ) => {
    const payment: SockbasePaymentDocument = {
      userId,
      paymentProductId,
      paymentAmount,
      paymentMethod,
      bankTransferCode,
      applicationId: targetType === 'circle' ? targetId : null,
      ticketId: targetType === 'ticket' ? targetId : null,
      id: '',
      paymentId: '',
      status: 0,
      createdAt: 0,
      updatedAt: 0
    }

    const adminApp = firebaseAdmin.getFirebaseAdmin()
    const firestore = adminApp.firestore()

    await firestore
      .collection('_payments')
      .withConverter(paymentConverter)
      .add(payment)
  }
