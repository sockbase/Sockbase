import { https } from 'firebase-functions'
import {
  type SockbaseApplicationLinksDocument,
  type SockbaseAccount,
  type SockbaseApplicationCreateResult,
  type SockbaseApplicationDocument,
  type SockbaseApplicationPayload,
  type SockbaseApplicationOverviewDocument
} from 'sockbase'
import dayjs from '../helpers/dayjs'

import { generateRandomCharacters } from '../helpers/random'
import { calculatePaymentAmount } from '../helpers/voucher'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { applicationConverter, applicationLinksConverter, overviewConverter } from '../libs/converters'
import { sendMessageToDiscord } from '../libs/sendWebhook'
import { getApplicaitonHashIdAsync, getApplicationByIdAsync, getApplicationByUserIdAndEventIdAsync } from '../models/application'
import { getEventByIdAsync } from '../models/event'
import { createCheckoutSessionAsync } from './CheckoutService'
import { generateBankTransferCode } from './PaymentService'
import { getVoucherAsync, useVoucherAsync } from './VoucherService'

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

const createApplicationAsync = async (userId: string, payload: SockbaseApplicationPayload): Promise<SockbaseApplicationCreateResult> => {
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
    else if (unionApp.eventId !== payload.app.eventId) {
      throw new https.HttpsError('invalid-argument', 'invalid_union_different_event')
    }
  }

  const event = await getEventByIdAsync(payload.app.eventId)
    .catch(() => {
      throw new https.HttpsError('not-found', 'Event')
    })
  const space = event.spaces.filter(s => s.id === payload.app.spaceId)[0]

  if (event.schedules.startApplication > timestamp || timestamp > event.schedules.endApplication) {
    throw new https.HttpsError('deadline-exceeded', 'application_out_of_term')
  }
  else if (!event.permissions.allowAdult && payload.app.circle.hasAdult) {
    throw new https.HttpsError('invalid-argument', 'invalid_argument_adult')
  }
  else if (!event.permissions.canUseBankTransfer && payload.app.paymentMethod === 'bankTransfer') {
    throw new https.HttpsError('invalid-argument', 'invalid_argument_bankTransfer')
  }
  else if (!space.acceptApplication) {
    throw new https.HttpsError('invalid-argument', 'invalid_argument_acceptApplication')
  }

  const voucher = payload.voucherId
    ? await getVoucherAsync(payload.voucherId)
    : undefined
  if (voucher === null) {
    throw new https.HttpsError('invalid-argument', 'voucher_not_found')
  }

  const paymentAmount = calculatePaymentAmount(space.price, voucher?.amount)
  if (voucher !== undefined && paymentAmount.paymentAmount > 0 && payload.app.paymentMethod === 'voucher') {
    throw new https.HttpsError('invalid-argument', 'voucher_not_usable')
  }

  const useVoucher = voucher
    ? await useVoucherAsync(1, payload.app.eventId, payload.app.spaceId, voucher.id)
    : null
  if (useVoucher === false) {
    throw new https.HttpsError('invalid-argument', 'voucher_not_usable')
  }

  const hashId = generateHashId(now)
  const app: SockbaseApplicationDocument = {
    id: '',
    ...payload.app,
    circle: {
      ...payload.app.circle,
      hasAdult: event.permissions.allowAdult && payload.app.circle.hasAdult
    },
    paymentMethod: useVoucher
      ? 'voucher'
      : payload.app.paymentMethod,
    userId,
    createdAt: now,
    updatedAt: null,
    hashId
  }

  const appRef = firestore.collection('_applications')
    .withConverter(applicationConverter)
    .doc()
  await appRef.set(app)

  const appId = appRef.id

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

  const overview: SockbaseApplicationOverviewDocument = {
    ...payload.app.overview,
    id: '',
    applicationId: appId,
    userId
  }

  await firestore
    .doc(`/_applicationOverviews/${appId}`)
    .withConverter(overviewConverter)
    .set(overview)

  const bankTransferCode = generateBankTransferCode(now)
  const createResult = await createCheckoutSessionAsync({
    now,
    userId,
    orgId: event._organization.id,
    paymentMethod: payload.app.paymentMethod === 'voucher'
      ? 3
      : payload.app.paymentMethod === 'online'
        ? 1
        : 2,
    paymentAmount: paymentAmount.paymentAmount,
    voucherAmount: paymentAmount.voucherAmount ?? 0,
    totalAmount: paymentAmount.spaceAmount,
    voucherId: voucher?.id ?? null,
    bankTransferCode,
    targetType: 'circle',
    targetId: appId,
    name: `${event.name} - ${space.name}`
  })

  await firestore.doc(`/_applicationHashIds/${hashId}`)
    .set({
      userId,
      hashId,
      applicationId: appId,
      paymentId: createResult?.paymentId,
      spaceId: null,
      eventId: payload.app.eventId,
      organizationId: event._organization.id
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
    username: `Sockbase: ${event.name}`,
    embeds: [
      {
        title: 'サークル申し込みを受け付けました！',
        url: '',
        color: 65280,
        fields: [
          {
            name: 'イベント名',
            value: event.name
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
          },
          {
            name: '支払い方法',
            value: payload.app.paymentMethod === 'online' ? 'オンライン' : '銀行振込'
          },
          {
            name: '支払い補助番号',
            value: bankTransferCode
          }
        ]
      }
    ]
  }

  await sendMessageToDiscord(event._organization.id, webhookBody)
    .then(() => console.log('sent webhook'))
    .catch(err => { throw err })

  const result: SockbaseApplicationCreateResult = {
    hashId,
    bankTransferCode,
    checkoutRequest: createResult?.checkoutRequest ?? null
  }

  return result
}

const generateHashId = (now: Date): string => {
  const codeDigit = 10
  const randomId = generateRandomCharacters(codeDigit, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  const formatedDateTime = dayjs(now).tz().format('YYMMDD')
  const hashId = `SC${formatedDateTime}${randomId}`
  return hashId
}

export default {
  fetchUserDataForEventAsync,
  createApplicationAsync
}
