import dayjs from 'dayjs'
import { type Response } from 'express'
import { type https } from 'firebase-functions'
import { Stripe } from 'stripe'
import { generateRandomCharacters } from '../helpers/random'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { paymentConverter, paymentHashConverter } from '../libs/converters'
import { sendMessageToDiscord } from '../libs/sendWebhook'
import { getApplicationByIdAsync } from '../models/application'
import { getEventByIdAsync } from '../models/event'
import { getStoreByIdAsync } from '../models/store'
import { getTicketByIdAsync } from '../models/ticket'
import type {
  SockbasePaymentDocument,
  SockbaseCheckoutResult,
  SockbaseCheckoutRequest,
  PaymentMethod
} from 'sockbase'

const firebaseProjectId = process.env.FUNC_FIREBASE_PROJECT_ID ?? ''
const userAppURL = process.env.FUNC_USER_APP_URL ?? ''

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()

const HANDLEABLE_EVENTS = {
  checkoutCompleted: 'checkout.session.completed'
}

const getStripe = (orgId: string): Stripe => {
  return new Stripe(
    orgId === 'npjpnet'
      ? process.env.STRIPE_SECRET_KEY_NPJPNET ?? ''
      : process.env.STRIPE_SECRET_KEY ?? '',
    { apiVersion: '2025-02-24.acacia' })
}

const processCoreAsync = async (req: https.Request, res: Response): Promise<void> => {
  const now = new Date()
  const event = req.body

  const orgId = req.query.orgId?.toString() || ''
  const stripe = getStripe(orgId)

  const eventType = event.type as string

  if (!Object.values(HANDLEABLE_EVENTS).includes(eventType)) {
    res.send({})
    return
  }

  switch (eventType) {
    case HANDLEABLE_EVENTS.checkoutCompleted: {
      const session = event.data.object as Stripe.Checkout.Session
      await applyCheckoutCompletedAsync(res, now, stripe, session, eventType, orgId)
      break
    }
  }
}

const applyCheckoutCompletedAsync =
  async (res: Response, now: Date, stripe: Stripe, session: Stripe.Checkout.Session, eventType: string, orgId: string | null): Promise<void> => {
    const paymentSnapshot = await firestore.collection('_payments')
      .withConverter(paymentConverter)
      .where('checkoutSessionId', '==', session.id)
      .get()
    const payments = paymentSnapshot.docs
      .map(p => p.data())
    if (payments.length !== 1) {
      res.status(204).send({ error: 'NotFound', detail: 'payment is not found' })
      return
    }

    const payment = payments[0]

    const paymentIntentId = session.payment_intent
    if (!paymentIntentId) {
      res.status(404).send({ error: 'NotFound', detail: 'paymentIntentId is not found' })
      return
    }
    else if (typeof paymentIntentId !== 'string') {
      res.status(500).send({ error: 'MissingType', detail: 'paymentIntentId type is missing' })
      return
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (!session.customer_details) {
      res.status(404).send({ error: 'NotFound', detail: 'customer is missing' })
      return
    }

    const chargeId = paymentIntent.latest_charge
    if (!chargeId) {
      res.status(404).send({ error: 'NotFound', detail: 'paymentIntentId is not found' })
      return
    }
    else if (typeof chargeId !== 'string') {
      res.status(500).send({ error: 'MissingType', detail: 'chargeId type is missing' })
      return
    }

    const charge = await stripe.charges.retrieve(chargeId)

    await firestore
      .doc(`/_payments/${payment.id}`)
      .set({
        paymentIntentId,
        status: 1,
        checkoutStatus: 1,
        updatedAt: now,
        purchasedAt: now,
        cardBrand: charge.payment_method_details?.card?.brand ?? null
      }, { merge: true })

    res.send({
      success: true,
      userId: payment.userId,
      paymentId: payment.id
    })

    noticeMessage(orgId, paymentIntentId, null)
  }

const createCheckoutSessionAsync = async (
  o: {
    now: Date,
    userId: string,
    orgId: string,
    paymentMethod: PaymentMethod,
    paymentAmount: number,
    bankTransferCode: string,
    name: string,
    targetType: 'circle' | 'ticket',
    targetId: string
  }
): Promise<{ checkoutRequest: SockbaseCheckoutRequest | null, paymentId: string }> => {
  const hashId = generateHashId(o.now)

  const paymentBase: SockbasePaymentDocument = {
    hashId,
    userId: o.userId,
    paymentAmount: o.paymentAmount,
    paymentMethod: o.paymentMethod,
    bankTransferCode: o.bankTransferCode,
    applicationId: o.targetType === 'circle' ? o.targetId : null,
    ticketId: o.targetType === 'ticket' ? o.targetId : null,
    createdAt: o.now,
    updatedAt: null,
    purchasedAt: null,
    id: '',
    paymentIntentId: '',
    checkoutSessionId: '',
    status: 0,
    checkoutStatus: 0,
    cardBrand: null
  }

  if (o.paymentMethod === 2) {
    const resultRef = firestore.collection('_payments')
      .withConverter(paymentConverter)
      .doc()
    const hashIdRef = firestore.doc(`_paymentHashes/${hashId}`)
      .withConverter(paymentHashConverter)

    await firestore.runTransaction(async tx => {
      tx.set(resultRef, paymentBase)
      tx.set(hashIdRef, {
        id: '',
        paymentId: resultRef.id,
        hashId,
        userId: o.userId
      })
    })

    return {
      checkoutRequest: {
        paymentMethod: o.paymentMethod,
        checkoutURL: '',
        amount: o.paymentAmount
      },
      paymentId: resultRef.id
    }
  }

  const productName = o.targetType === 'circle'
    ? `${o.name} (サークル参加)`
    : o.targetType === 'ticket'
      ? `${o.name} (チケット購入)`
      : o.name

  const stripe = getStripe(o.orgId)
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'jpy',
          product_data: {
            name: productName
          },
          unit_amount: o.paymentAmount
        },
        quantity: 1
      }
    ],
    success_url: `${userAppURL}/checkout?cs={CHECKOUT_SESSION_ID}`
  })

  if (!session) {
    throw new Error('session is not found')
  }
  else if (!session.url) {
    throw new Error('session url is not found')
  }

  const payment: SockbasePaymentDocument = {
    ...paymentBase,
    checkoutSessionId: session.id
  }

  const resultRef = await firestore.collection('_payments')
    .withConverter(paymentConverter)
    .doc()
  const hashIdRef = firestore.doc(`_paymentHashes/${hashId}`)
    .withConverter(paymentHashConverter)

  await firestore.runTransaction(async tx => {
    tx.set(resultRef, payment)
    tx.set(hashIdRef, {
      id: '',
      paymentId: resultRef.id,
      hashId,
      userId: o.userId
    })
  })

  return {
    checkoutRequest: {
      paymentMethod: o.paymentMethod,
      checkoutURL: session.url,
      amount: o.paymentAmount
    },
    paymentId: resultRef.id
  }
}

const refreshCheckoutSessionAsync = async (userId: string, paymentId: string): Promise<SockbaseCheckoutRequest> => {
  const now = new Date()

  const paymentDoc = await firestore.doc(`_payments/${paymentId}`)
    .withConverter(paymentConverter)
    .get()
  const payment = paymentDoc.data()
  if (!payment || payment.userId !== userId) {
    throw new Error('payment not found')
  }
  else if (payment.paymentMethod !== 1) {
    throw new Error('payment method is not online payment')
  }
  else if (payment.checkoutStatus !== 0 || payment.status !== 0) {
    throw new Error('checkout is complete')
  }

  if (payment.applicationId) {
    const app = await getApplicationByIdAsync(payment.applicationId)
    const event = await getEventByIdAsync(app.eventId)

    const type = event.spaces.find(space => space.id === app.spaceId)
    const name = `${event.name} - ${type!.name}`

    return refreshCheckoutSessionCoreAsync(payment, event._organization.id, name, now)
  }
  else if (payment.ticketId) {
    const ticket = await getTicketByIdAsync(payment.ticketId)
    const store = await getStoreByIdAsync(ticket.storeId)

    const type = store.types.find(type => type.id === ticket.typeId)
    const name = `${store.name} - ${type!.name}`

    return refreshCheckoutSessionCoreAsync(payment, store._organization.id, name, now)
  }
  else {
    throw new Error('target is not found')
  }
}

const refreshCheckoutSessionCoreAsync = async (payment: SockbasePaymentDocument, orgId: string, name: string, now: Date): Promise<SockbaseCheckoutRequest> => {
  const stripe = getStripe(orgId)
  const session = await stripe.checkout.sessions.retrieve(payment.checkoutSessionId)
  if (session.status === 'open') {
    return {
      paymentMethod: payment.paymentMethod,
      checkoutURL: session.url ?? '',
      amount: payment.paymentAmount
    }
  }
  else {
    const newSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name
            },
            unit_amount: payment.paymentAmount
          },
          quantity: 1
        }
      ],
      success_url: `${userAppURL}/checkout?cs={CHECKOUT_SESSION_ID}`
    })

    await firestore.doc(`/_payments/${payment.id}`)
      .set({
        checkoutSessionId: newSession.id,
        updatedAt: now
      }, { merge: true })

    return {
      paymentMethod: payment.paymentMethod,
      checkoutURL: newSession.url ?? '',
      amount: payment.paymentAmount
    }
  }
}

const getCheckoutBySessionIdAsync = async (userId: string, sessionId: string): Promise<SockbaseCheckoutResult | null> => {
  const paymentSnapshot = await firestore.collection('_payments')
    .withConverter(paymentConverter)
    .where('userId', '==', userId)
    .where('checkoutSessionId', '==', sessionId)
    .where('paymentMethod', '==', 1)
    .get()

  const payments = paymentSnapshot.docs
    .map(p => p.data())

  if (payments.length !== 1) {
    throw new Error('payment document is not found')
  }

  const payment = payments[0]

  const result: SockbaseCheckoutResult = {
    status: payment.checkoutStatus,
    ticketHashId: payment.ticketId ? (await getTicketByIdAsync(payment.ticketId)).hashId : null,
    applicaitonHashId: payment.applicationId ? (await getApplicationByIdAsync(payment.applicationId)).hashId : null
  }

  await firestore.doc(`/_payments/${payment.id}`)
    .set({ checkoutStatus: 2 }, { merge: true })

  return result
}

const noticeMessage = (orgId: string | null, stripePaymentId: string, errorDetail: string | null, noticeType?: number): void => {
  const body = errorDetail
    ? {
      username: `Sockbase: ${noticeType === 1 ? '注意情報' : '決済エラー'}`,
      embeds: [
        {
          title: noticeType === 1 ? '注意情報' : '決済でエラーが発生しました！',
          description: '決済エラーが発生しました。Stripeダッシュボードを確認してください。',
          url: '',
          color: noticeType === 1 ? 11917587 : 12922671,
          fields: [
            {
              name: '環境',
              value: firebaseProjectId
            },
            {
              name: 'エラー種類',
              value: errorDetail
            },
            {
              name: 'Stripe決済ID',
              value: stripePaymentId
            }
          ]
        }
      ]
    }
    : {
      username: 'Sockbase: 決済完了',
      embeds: [
        {
          title: '決済が完了しました！',
          description: '以下の決済依頼ステータスを完了にしました。',
          url: '',
          color: 3130679,
          fields: [
            {
              name: '環境',
              value: firebaseProjectId
            },
            {
              name: 'Stripe決済ID',
              value: stripePaymentId
            }
          ]
        }
      ]
    }

  sendMessageToDiscord(orgId || 'system', body)
    .catch(err => { throw err })
}

const generateHashId = (now: Date): string => {
  const codeDigit = 12
  const randomId = generateRandomCharacters(codeDigit, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  const formatedDateTime = dayjs(now).tz().format('MMDD')
  const hashId = `SP${formatedDateTime}${randomId}`
  return hashId
}

export {
  processCoreAsync,
  createCheckoutSessionAsync,
  refreshCheckoutSessionAsync,
  getCheckoutBySessionIdAsync
}
