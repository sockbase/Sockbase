import * as functions from 'firebase-functions'
import { Stripe } from 'stripe'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { paymentConverter, userConverter } from '../libs/converters'
import type * as types from 'packages/types/src'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2022-11-15' })

enum Status {
  Pending = 0,
  Paid = 1,
  PaymentFailure = 3
}

const firestore = FirebaseAdmin.getFirebaseAdmin().firestore()

const updateStatus = async (
  payments: types.SockbasePaymentDocument[],
  items: Stripe.LineItem[] | undefined,
  status: number,
  now: Date
): Promise<void> => {
  const itemIds = (items ?? []).filter(x => x.price !== undefined).map(x => x.price?.id as string)
  for (const payment of payments) {
    if (itemIds.includes(payment.paymentProductId)) {
      await firestore.doc(`/_payments/${payment.id}`).set({
        status,
        updatedAt: now
      }, { merge: true })
    }
  }
}

const collectPayments = async (userId: string, status: number): Promise<types.SockbasePaymentDocument[]> => {
  const paymentSnapshot = await firestore.collection('_payments')
    .where('userId', '==', userId)
    .where('status', '==', status)
    .withConverter(paymentConverter)
    .get()
  return paymentSnapshot.docs.map(x => x.data())
}

const getUser = async (email: string): Promise<types.SockbaseAccountDocument | null> => {
  const userSnapshot = await firestore.collection('users').where('email', '==', email).withConverter(userConverter).get()
  const users = userSnapshot.docs.map(x => x.data())
  return users.length === 0 ? null : users[0]
}

const HANDLEABLE_EVENTS = {
  checkoutCompleted: 'checkout.session.completed',
  asyncPaymentSuccessed: 'checkout.session.async_payment_succeeded',
  asyncPaymentFailed: 'checkout.session.async_payment_failed'
}

export const treatCheckoutStatusWebhook = functions.https.onRequest(async (req, res) => {
  const event = req.body
  // 扱うイベント以外は即returnする
  if (!Object.values(HANDLEABLE_EVENTS).includes(event.type)) {
    res.send({})
    return
  }
  const now = new Date()
  const session = event.data.object as Stripe.Checkout.Session
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
  if (session.customer_details === null) {
    res.status(404).send({ error: 'NotFound', detail: 'custome is missing' })
    return
  }
  const email = session.customer_details.email
  if (email === null) {
    res.status(400).send({ error: 'EmailIsMissing', detail: 'email is missing' })
    return
  }
  const user = await getUser(email)
  if (user === null) {
    res.status(404).send({ error: 'NotFound', detail: `user(${email}) is not found` })
    return
  }
  switch (event.type) {
    case HANDLEABLE_EVENTS.checkoutCompleted: {
      const payments = await collectPayments(user.id, Status.Pending)
      // クレカなどの即決済時のみ処理する
      // 銀行振り込みなどの遅延決済時はなにも処理しない
      if (session.payment_status !== 'paid') {
        break
      }
      await updateStatus(payments, lineItems.data, Status.Paid, now)
      break
    }

    case HANDLEABLE_EVENTS.asyncPaymentSuccessed: {
      const payments = await collectPayments(user.id, Status.Pending)
      await updateStatus(payments, lineItems.data, Status.Paid, now)
      break
    }

    case HANDLEABLE_EVENTS.asyncPaymentFailed: {
      const payments = await collectPayments(user.id, Status.Pending)
      await updateStatus(payments, lineItems.data, Status.PaymentFailure, now)
      break
    }
  }
  res.send({})
})
