import { MD5, enc } from 'crypto-js'
import dayjs from '../helpers/dayjs'

import type {
  SockbaseAccount,
  SockbaseApplication,
  SockbaseApplicationAddedResult,
  SockbaseApplicationDocument,
  SockbaseEvent
} from 'sockbase'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import * as functions from 'firebase-functions'

import firebaseAdmin from '../libs/FirebaseAdmin'
import { applicationConverter, applicationHashIdConverter } from '../libs/converters'

import { sendMessageToDiscord } from '../libs/sendWebhook'
import { createPayment, generateBankTransferCode } from './payment'

export const onChangeApplication = functions.firestore
  .document('/_applications/{applicationId}')
  .onUpdate(async (change: functions.Change<QueryDocumentSnapshot>) => {
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

export const createApplication = functions.https.onCall(
  async (app: SockbaseApplication, context): Promise<SockbaseApplicationAddedResult> => {
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

      if (unionApp?.unionCircleId) {
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

    if (!event.permissions.allowAdult && app.circle.hasAdult) {
      throw new functions.https.HttpsError('invalid-argument', 'invalid_argument_adult')
    }

    const appDoc: SockbaseApplicationDocument = {
      ...app,
      circle: {
        ...app.circle,
        hasAdult: event.permissions.allowAdult && app.circle.hasAdult
      },
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

    const hashId = generateHashId(eventId, appId, now)
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
            },
            {
              name: 'スペース',
              value: space.name
            }
          ]
        }
      ]
    }

    sendMessageToDiscord(event._organization.id, webhookBody)
      .then(() => console.log('sent webhook'))
      .catch(err => { throw err })

    const result: SockbaseApplicationAddedResult = {
      hashId,
      bankTransferCode
    }

    return result
  })

const generateHashId = (eventId: string, refId: string, now: Date): string => {
  const salt = 'sockbase-yogurt-koharurikka516'
  const codeDigit = 8
  const refHashId = MD5(`${eventId}.${refId}.${salt}`)
    .toString(enc.Hex)
    .slice(0, codeDigit)
  const formatedDateTime = dayjs(now).tz().format('YYYYMMDDHHmmssSSS')
  const hashId = `${formatedDateTime}-${refHashId}`

  return hashId
}
