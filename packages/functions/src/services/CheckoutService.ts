import { type Response } from 'express'
import { Stripe } from 'stripe'
import { type UserRecord } from 'firebase-admin/auth'
import { type https } from 'firebase-functions'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { sendMessageToDiscord } from '../libs/sendWebhook'
import {
  type PaymentStatus,
  type SockbasePaymentDocument
} from 'sockbase'
import { paymentConverter } from '../libs/converters'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2022-11-15' })
const firebaseProjectId = process.env.FUNC_FIREBASE_PROJECT_ID ?? ''

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()
const auth = adminApp.auth()

const HANDLEABLE_EVENTS = {
  checkoutCompleted: 'checkout.session.completed',
  asyncPaymentSuccessed: 'checkout.session.async_payment_succeeded',
  asyncPaymentFailed: 'checkout.session.async_payment_failed'
}

enum Status {
  Pending = 0,
  Paid = 1,
  PaymentFailure = 3
}

const checkoutPaymentAsync = async (req: https.Request, res: Response): Promise<void> => {
  const now = new Date()
  const event = req.body

  if (!Object.values(HANDLEABLE_EVENTS).includes(event.type)) {
    res.send({})
    return
  }

  const session = event.data.object as Stripe.Checkout.Session
  if (!session.customer_details) {
    res.status(404).send({ error: 'NotFound', detail: 'customer is missing' })
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
    noticeMessage(paymentId, 'email is missing')
    return
  }

  const user = await getUser(email)
  if (!user) {
    res.status(404).send({ error: 'NotFound', detail: `user(${email}) is not found` })
    noticeMessage(paymentId, `user(${email}) is not found`)
    return
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
  const productItemIds = lineItems.data
    .filter(p => p.price)
    .map(p => p.price?.id ?? '')

  const payment = await collectPayments(user.uid, Status.Pending, productItemIds)
  if (!payment) {
    res.status(404).send({ error: 'NotFound', detail: 'required payment is not found' })
    noticeMessage(paymentId, `required payment is not found`)
    return
  }

  switch (event.type) {
    case HANDLEABLE_EVENTS.checkoutCompleted: {
      // クレカなどの即決済時のみ処理する
      // 銀行振り込みなどの遅延決済時はなにも処理しない
      if (session.payment_status !== 'paid') break

      if (!await updateStatus(payment, lineItems.data, paymentId, Status.Paid, now)) {
        res.status(404).send({ error: 'NotFound', detail: 'required product item is not found' })
        noticeMessage(paymentId, `required product item is not found`)
        return
      }
      break
    }

    case HANDLEABLE_EVENTS.asyncPaymentSuccessed: {
      if (!await updateStatus(payment, lineItems.data, paymentId, Status.Paid, now)) {
        res.status(404).send({ error: 'NotFound', detail: 'required product item is not found' })
        noticeMessage(paymentId, `required product item is not found`)
        return
      }
      break
    }

    case HANDLEABLE_EVENTS.asyncPaymentFailed: {
      if (!await updateStatus(payment, lineItems.data, paymentId, Status.PaymentFailure, now)) {
        res.status(404).send({ error: 'NotFound', detail: 'required product item is not found' })
        noticeMessage(paymentId, `required product item is not found`,)
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
  noticeMessage(paymentId, null)
}

const getUser = async (email: string): Promise<UserRecord> => {
  const user = await auth.getUserByEmail(email)
  return user
}

const collectPayments =
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

const noticeMessage = (paymentId: string, errorDetail: string | null): void => {
  const body = errorDetail
    ? {
      username: 'Sockbase: 決済エラー',
      embeds: [
        {
          title: '決済でエラーが発生しました！',
          description: '決済でエラーが発生した可能性があります。Stripeダッシュボードを確認してください。',
          url: '',
          color: 16711680,
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
              value: paymentId
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
          color: 65280,
          fields: [
            {
              name: '環境',
              value: firebaseProjectId
            },
            {
              name: 'Stripe決済ID',
              value: paymentId
            }
          ]
        }
      ]
    }

  sendMessageToDiscord('system', body)
    .catch(err => { throw err })
}

export default {
  checkoutPaymentAsync
}