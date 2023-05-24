import * as functions from 'firebase-functions'
import { Stripe } from 'stripe'
import { paymentConverter, userConverter } from '../libs/converters'
import type * as types from 'sockbase'
import firebaseAdmin from '../libs/FirebaseAdmin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2022-11-15' })

enum Status {
  Pending = 0,
  Paid = 1,
  PaymentFailure = 3
}

const firestore = firebaseAdmin.getFirebaseAdmin().firestore()

const updateStatus = async (
  payments: types.SockbasePaymentDocument[],
  items: Stripe.LineItem[],
  status: types.PaymentStatus,
  now: Date
): Promise<void> => {
  console.log(items)

  const itemIds = items
    .filter(x => x.price)
    .map(x => x.price?.id)

  const payment = payments
    .filter(p => itemIds.includes(p.paymentProductId))[0]

  await firestore.doc(`/_payments/${payment.id}`)
    .set({
      status,
      updateStatus: now
    }, { merge: true })
}

const collectPayments = async (userId: string, status: number): Promise<types.SockbasePaymentDocument[]> => {
  const paymentSnapshot = await firestore.collection('_payments')
    .withConverter(paymentConverter)
    .where('userId', '==', userId)
    .where('status', '==', status)
    .get()

  return paymentSnapshot.docs
    .map(x => x.data())
}

const getUser = async (email: string): Promise<types.SockbaseAccountDocument | null> => {
  const userSnapshot = await firestore.collection('users')
    .withConverter(userConverter)
    .where('email', '==', email)
    .get()
  const users = userSnapshot.docs
    .map(x => x.data())

  return users.length === 1 ? users[0] : null
}

const HANDLEABLE_EVENTS = {
  checkoutCompleted: 'checkout.session.completed',
  asyncPaymentSuccessed: 'checkout.session.async_payment_succeeded',
  asyncPaymentFailed: 'checkout.session.async_payment_failed'
}

export const treatCheckoutStatusWebhook = functions.https.onRequest(async (req, res) => {
  const event = req.body

  if (!Object.values(HANDLEABLE_EVENTS).includes(event.type)) {
    res.send({})
    return
  }

  const now = new Date()

  const session = event.data.object as Stripe.Checkout.Session
  if (!session.customer_details) {
    res.status(404).send({ error: 'NotFound', detail: 'custome is missing' })
    return
  }

  const email = session.customer_details.email
  if (!email) {
    res.status(400).send({ error: 'EmailIsMissing', detail: 'email is missing' })
    return
  }

  const user = await getUser(email)
  if (!user) {
    res.status(404).send({ error: 'NotFound', detail: `user(${email}) is not found` })
    return
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

  switch (event.type) {
    case HANDLEABLE_EVENTS.checkoutCompleted: {
      // クレカなどの即決済時のみ処理する
      // 銀行振り込みなどの遅延決済時はなにも処理しない
      if (session.payment_status !== 'paid') break

      const payments = await collectPayments(user.id, Status.Pending)
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
