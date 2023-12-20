import { https } from 'firebase-functions'
import { MD5, enc } from 'crypto-js'
import {
  type SockbaseApplicationLinksDocument,
  type SockbaseAccount,
  type SockbaseApplicationAddedResult,
  type SockbaseApplicationDocument,
  type SockbaseApplicationPayload
} from 'sockbase'
import dayjs from '../helpers/dayjs'

import FirebaseAdmin from '../libs/FirebaseAdmin'
import { applicationConverter, applicationLinksConverter } from '../libs/converters'
import PaymentService from './PaymentService'
import { sendMessageToDiscord } from '../libs/sendWebhook'
import { getEventByIdAsync } from '../models/event'
import { getApplicaitonHashIdAsync, getApplicationByIdAsync, getApplicationByUserIdAndEventIdAsync } from '../models/application'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()

const fetchUserDataForEventAsync = async (userId: string, eventId: string): Promise<void> => {
  const userDoc = await firestore
    .doc(`/users/${userId}`)
    .get()
  if (!userDoc.exists) return

  const userData = userDoc.data() as SockbaseAccount
  await firestore
    .doc(`/events/${eventId}/_users/${userId}`)
    .set(userData)
}

const createApplicationAsync = async (userId: string, payload: SockbaseApplicationPayload): Promise<SockbaseApplicationAddedResult> => {
  const now = new Date()
  const timestamp = now.getTime()

  const existsApp = await getApplicationByUserIdAndEventIdAsync(userId, payload.app.eventId)
  if (existsApp !== null) {
    throw new https.HttpsError('already-exists', 'application_already_exists')
  }

  const unionAppHashDoc = payload.app.unionCircleId
    ? (await getApplicaitonHashIdAsync(payload.app.unionCircleId)
        .catch(() => {
          throw new https.HttpsError('not-found', 'application_invalid_unionCircleId')
        }))
    : null
  if (unionAppHashDoc !== null) {
    const unionApp = await getApplicationByIdAsync(unionAppHashDoc.applicationId)
    if (unionApp?.unionCircleId) {
      throw new https.HttpsError('already-exists', 'application_already_union')
    }
  }

  const event = await getEventByIdAsync(payload.app.eventId)
    .catch(() => {
      throw new https.HttpsError('not-found', 'Event')
    })
  if (event.schedules.startApplication > timestamp || timestamp > event.schedules.endApplication) {
    throw new https.HttpsError('deadline-exceeded', 'application_out_of_term')
  } else if (!event.permissions.allowAdult && payload.app.circle.hasAdult) {
    throw new https.HttpsError('invalid-argument', 'invalid_argument_adult')
  }

  const appDoc: SockbaseApplicationDocument = {
    ...payload.app,
    circle: {
      ...payload.app.circle,
      hasAdult: event.permissions.allowAdult && payload.app.circle.hasAdult
    },
    userId,
    createdAt: now,
    updatedAt: null,
    hashId: null
  }

  const addResult = await firestore.collection('_applications')
    .withConverter(applicationConverter)
    .add(appDoc)
  const appId = addResult.id

  await firestore
    .doc(`/_applications/${appId}/private/meta`)
    .set({ applicationStatus: 0 })

  const links: SockbaseApplicationLinksDocument = {
    ...payload.links,
    id: '',
    applicationId: appId,
    userId
  }
  await firestore
    .doc(`/_applicationLinks/${appId}`)
    .withConverter(applicationLinksConverter)
    .set(links)

  const space = event.spaces.filter(s => s.id === payload.app.spaceId)[0]

  const bankTransferCode = PaymentService.generateBankTransferCode(now)
  const paymentId = space.productInfo
    ? await PaymentService.createPaymentAsync(
      userId,
      payload.app.paymentMethod === 'online' ? 1 : 2,
      bankTransferCode,
      space.productInfo.productId,
      space.price,
      'circle',
      appId
    )
    : null

  const hashId = generateHashId(payload.app.eventId, appId, now)
  await firestore.doc(`/_applications/${appId}`)
    .set({
      hashId
    }, {
      merge: true
    })

  await firestore.doc(`/_applicationHashIds/${hashId}`)
    .set({
      hashId,
      applicationId: appId,
      paymentId,
      spaceId: null
    }, {
      merge: true
    })

  if (unionAppHashDoc !== null) {
    await firestore
      .doc(`/_applications/${unionAppHashDoc.applicationId}`)
      .set({
        unionCircleId: hashId
      }, {
        merge: true
      })
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
            value: payload.app.circle.name
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

  await sendMessageToDiscord(event._organization.id, webhookBody)
    .then(() => console.log('sent webhook'))
    .catch(err => { throw err })

  const result: SockbaseApplicationAddedResult = {
    hashId,
    bankTransferCode
  }

  return result
}

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

export default {
  fetchUserDataForEventAsync,
  createApplicationAsync
}
