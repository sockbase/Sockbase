import * as functions from 'firebase-functions'
import { type DocumentData } from 'firebase-admin/firestore'
import { type Stripe } from 'stripe'
import FirebaseAdmin from '../libs/FirebaseAdmin'

enum Status {
  Pending = 0,
  Paid = 1,
  Refunded = 2,
  PaymentFailure = 3
}

const firestore = FirebaseAdmin.getFirebaseAdmin().firestore()

const updateStatus = async (
  payments: DocumentData[],
  items: Stripe.LineItem[] | undefined,
  status: number,
  now: Date
): Promise<void> => {
  const itemMap = new Map<string, Stripe.LineItem>();
  (items ?? []).forEach((x: Stripe.LineItem) => itemMap.set(x.id, x))
  for (const payment of payments) {
    if (itemMap.get(payment.paymentProductId) !== undefined) {
      await payment.ref.update({
        status,
        updatedAt: now.getTime()
      })
    }
  }
}

const collectPayments = async (userId: string, status: number): Promise<DocumentData[]> => {
  const payments = await firestore.collection('_payments')
    .where('userId', '==', userId)
    .where('status', '==', status.toString()).get()
  const results: DocumentData[] = []
  payments.forEach(x => results.push(x))
  return results
}

const getUser = async (email: string): Promise<DocumentData | undefined> => {
  const users = await firestore.collection('users').where('email', '==', email).get()
  const results: DocumentData[] = []
  users.forEach(x => results.push(x))
  return results.length === 0 ? undefined : results[0]
}

const TREATABLE_EVENTS = [
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'charge.refunded'
]

export const treatCheckoutStatusWebhook = functions.https.onRequest(async (req, res) => {
  const event = req.body
  // 扱うイベント以外は即returnする
  if (!TREATABLE_EVENTS.includes(event.type)) {
    res.send({})
    return
  }
  const now = new Date()
  const session = event.data.object as Stripe.Checkout.Session
  const email = session.customer_details?.email ?? ''
  if (email === '') {
    res.status(400).send({ error: 'EmailIsMissing', detail: 'email is missing' })
    return
  }
  const userId = (await getUser(email))?.id as string ?? ''
  if (userId === '') {
    res.status(404).send({ error: 'NotFound', detail: `user(${email}) is not found` })
    return
  }
  switch (event.type) {
    case 'checkout.session.completed': {
      const payments = await collectPayments(userId, Status.Pending)
      // クレカなどの即決済時のみ処理する
      // 銀行振り込みなどの遅延決済時はなにも処理しない
      if (session.payment_status !== 'paid') {
        break
      }
      await updateStatus(payments, session.line_items?.data, Status.Paid, now)
      break
    }

    case 'checkout.session.async_payment_succeeded': {
      const payments = await collectPayments(userId, Status.Pending)
      await updateStatus(payments, session.line_items?.data, Status.Paid, now)
      break
    }

    case 'checkout.session.async_payment_failed': {
      const payments = await collectPayments(userId, Status.Pending)
      await updateStatus(payments, session.line_items?.data, Status.PaymentFailure, now)
      break
    }

    case 'charge.refunded': {
      const payments = await collectPayments(userId, Status.PaymentFailure)
      await updateStatus(payments, session.line_items?.data, Status.Refunded, now)
      break
    }
  }
  res.send({})
})
