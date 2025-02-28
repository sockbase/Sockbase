import { type Response } from 'express'
import { type UserRecord } from 'firebase-admin/auth'
import { type https } from 'firebase-functions'
import {
  type SockbasePaymentResult,
  type PaymentStatus,
  type SockbasePaymentDocument
} from 'sockbase'
import { Stripe } from 'stripe'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { eventConverter, paymentConverter, storeConverter } from '../libs/converters'
import { sendMessageToDiscord } from '../libs/sendWebhook'

const firebaseProjectId = process.env.FUNC_FIREBASE_PROJECT_ID ?? ''

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()
const auth = adminApp.auth()

const HANDLEABLE_EVENTS = {
  checkoutCompleted: 'checkout.session.completed',
  asyncPaymentSuccessed: 'checkout.session.async_payment_succeeded',
  asyncPaymentFailed: 'checkout.session.async_payment_failed',
  chargeUpdated: 'charge.updated'
}

enum Status {
  Pending = 0,
  Paid = 1,
  PaymentFailure = 3
}

const processCoreAsync = async (req: https.Request, res: Response): Promise<void> => {
  const now = new Date()
  const event = req.body

  const orgId = req.query.orgId?.toString() || null

  const stripe = new Stripe(
    orgId === 'npjpnet'
      ? process.env.STRIPE_SECRET_KEY_NPJPNET ?? ''
      : process.env.STRIPE_SECRET_KEY ?? '',
    { apiVersion: '2022-11-15' })

  const eventType = event.type as string

  if (!Object.values(HANDLEABLE_EVENTS).includes(eventType)) {
    res.send({})
    return
  }

  switch (eventType) {
    case HANDLEABLE_EVENTS.checkoutCompleted:
    case HANDLEABLE_EVENTS.asyncPaymentSuccessed:
    case HANDLEABLE_EVENTS.asyncPaymentFailed: {
      const session = event.data.object as Stripe.Checkout.Session
      await applyCheckoutCompletedAsync(res, now, stripe, session, eventType, orgId)
      break
    }

    case HANDLEABLE_EVENTS.chargeUpdated: {
      const charge = event.data.object as Stripe.Charge
      await applyResultAsync(res, now, stripe, charge)
      break
    }
  }
}

const applyCheckoutCompletedAsync =
  async (res: Response, now: Date, stripe: Stripe, session: Stripe.Checkout.Session, eventType: string, orgId: string | null): Promise<void> => {
    if (!session.customer_details) {
      res.status(404).send({ error: 'NotFound', detail: 'customer is missing' })
      return
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
    const productItemIds = lineItems.data
      .filter(p => p.price)
      .map(p => p.price?.id ?? '')

    const storeDocs = await firestore.collection('stores')
      .withConverter(storeConverter)
      .get()
    const ticketTypeProductIds = storeDocs.docs
      .map(s => s.data())
      .map(s => s.types.map(t => t.productInfo?.productId))
      .filter(id => id)
      .reduce((p, c) => ([...p, ...c]), []) as string[]

    const eventDocs = await firestore.collection('events')
      .withConverter(eventConverter)
      .get()
    const spaceTypeProductIds = eventDocs.docs
      .map(e => e.data())
      .map(e => e.spaces.map(s => s.productInfo?.productId))
      .filter(id => id)
      .reduce((p, c) => ([...p, ...c]), []) as string[]

    const productIds = [...ticketTypeProductIds, ...spaceTypeProductIds]

    const systemExistProductIds = productItemIds
      .map(id => productIds.includes(id))
      .filter(exists => exists)
      .length > 0
    if (!systemExistProductIds) {
      res.status(204).send()
      return
    }

    const paymentId = session.payment_intent
    if (!paymentId) {
      res.status(404).send({ error: 'NotFound', detail: 'paymentId is not found' })
      return
    }
    else if (typeof paymentId !== 'string') {
      res.status(500).send({ error: 'MissingType', detail: 'paymentId type is missing' })
      return
    }

    const email = session.customer_details.email
    if (!email) {
      res.status(400).send({ error: 'EmailIsMissing', detail: 'email is missing' })
      noticeMessage(orgId, paymentId, 'email is missing')
      return
    }

    const user = await getUser(email)
    if (!user) {
      res.send({ error: 'NotFound', detail: `user(${email}) is not found` })
      noticeMessage(orgId, paymentId, `user(${email}) is not found`)
      return
    }

    const payment = await collectPayment(user.uid, Status.Pending, productItemIds)
    if (!payment) {
      noticeMessage(orgId, paymentId, 'required payment is not found')
      res.status(404).send({ error: 'NotFound', detail: 'required payment is not found' })
      return
    }

    switch (eventType) {
      case HANDLEABLE_EVENTS.checkoutCompleted: {
      // クレカなどの即決済時のみ処理する
      // 銀行振り込みなどの遅延決済時はなにも処理しない
        if (session.payment_status !== 'paid') break

        if (!await updateStatus(payment, lineItems.data, paymentId, Status.Paid, now)) {
          res.status(404).send({ error: 'NotFound', detail: 'required product item is not found' })
          noticeMessage(orgId, paymentId, 'required product item is not found')
          return
        }
        break
      }

      case HANDLEABLE_EVENTS.asyncPaymentSuccessed: {
        if (!await updateStatus(payment, lineItems.data, paymentId, Status.Paid, now)) {
          res.status(404).send({ error: 'NotFound', detail: 'required product item is not found' })
          noticeMessage(orgId, paymentId, 'required product item is not found')
          return
        }
        break
      }

      case HANDLEABLE_EVENTS.asyncPaymentFailed: {
        if (!await updateStatus(payment, lineItems.data, paymentId, Status.PaymentFailure, now)) {
          res.status(404).send({ error: 'NotFound', detail: 'required product item is not found' })
          noticeMessage(orgId, paymentId, 'required product item is not found')
          return
        }
        break
      }
    }

    res.send({
      success: true,
      userId: user.uid,
      paymentId: payment.id
    })
    noticeMessage(orgId, paymentId, null)
  }

const getUser = async (email: string): Promise<UserRecord | null> => {
  const user = await auth.getUserByEmail(email)
    .catch(() => null)
  return user
}

const collectPayment =
  async (userId: string, status: number, productItemIds: Array<string | undefined>): Promise<SockbasePaymentDocument | null> => {
    const paymentSnapshot = await firestore.collection('_payments')
      .withConverter(paymentConverter)
      .where('userId', '==', userId)
      .where('status', '==', status)
      .where('paymentMethod', '==', 1)
      .get()
    const payments = paymentSnapshot.docs
      .map(p => p.data())
      .filter(p => productItemIds.includes(p.paymentProductId))

    return payments.length > 0 ? payments[0] : null
  }

const updateStatus = async (
  payment: SockbasePaymentDocument,
  productItems: Stripe.LineItem[],
  paymentId: string,
  status: PaymentStatus,
  now: Date
): Promise<boolean> => {
  const productItemIds = productItems
    .filter(p => p.price)
    .map(p => p.price?.id)

  if (!productItemIds.includes(payment.paymentProductId)) {
    return false
  }

  await firestore.doc(`/_payments/${payment.id}`)
    .set({
      paymentId,
      status,
      updatedAt: now
    }, {
      merge: true
    })

  return true
}

const applyResultAsync = async (res: Response, now: Date, stripe: Stripe, charge: Stripe.Charge): Promise<void> => {
  const paymentId = charge.payment_intent
  if (!paymentId) {
    res.status(404).send({ error: 'NotFound', detail: 'paymentId is not found' })
    return
  }
  else if (typeof paymentId !== 'string') {
    res.status(500).send({ error: 'MissingType', detail: 'paymentId type is missing' })
    return
  }

  const payment = await getPaymentAsync(paymentId)
  if (!payment) {
    noticeMessage(null, paymentId, 'payment document is not found', 1)
    res.status(204).send()
    return
  }

  const paymentResultData: SockbasePaymentResult = {
    cardBrand: charge.payment_method_details?.card?.brand ?? null,
    receiptURL: charge.receipt_url
  }

  await firestore.doc(`/_payments/${payment.id}`)
    .set({
      paymentResult: paymentResultData,
      updatedAt: now
    }, {
      merge: true
    })

  res.send({
    success: true,
    paymentId: payment.id,
    paymentResult: paymentResultData
  })
}

const getPaymentAsync = async (paymentId: string): Promise<SockbasePaymentDocument | null> => {
  const paymentSnapshot = await firestore.collection('_payments')
    .withConverter(paymentConverter)
    .where('paymentId', '==', paymentId)
    .get()
  const payments = paymentSnapshot.docs
    .map(p => p.data())

  return payments.length > 0 ? payments[0] : null
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

export default {
  processCoreAsync
}
