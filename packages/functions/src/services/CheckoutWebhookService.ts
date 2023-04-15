import * as functions from 'firebase-functions'
import { type DocumentData } from 'firebase-admin/firestore'
import { type Stripe } from 'stripe'
import FirebaseAdmin from '../libs/FirebaseAdmin'

const online = 1
const bankTransfer = 2
const paid = 1
const pending = 0
const paymentFailure = 3
const refunded = 2

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
    const paymentRef = firestore.collection('_payments').doc(payment.id)
    if (itemMap.get(payment.id) !== undefined) {
      await paymentRef.update({
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

export const treatCheckoutStatusWebhook = functions.https.onRequest(async (req, res) => {
  const event = req.body
  const now = new Date()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      // クレカなどの即決済時
      if (session.payment_status === 'paid') {
        for (const item of (session.line_items?.data ?? [])) {
          const applicationId = item.id === process.env.CIRCLE_PARCHASE_ID ? item.id : undefined
          const ticketId = item.id === process.env.TICKET_PARCHASE_ID ? item.id : undefined
          await firestore.collection('_payments').add({
            userId: 'なんかID',
            paymentType: online,
            paymentId: 'なんかID',
            bankTransferCode: undefined,
            paymentAmount: item.amount_total,
            status: paid,
            applicationId,
            ticketId,
            createdAt: now.getTime(),
            updatedAt: now.getTime()
          })
        }
        break
      }
      // 銀行振り込みなどの遅延決済時
      for (const item of (session.line_items?.data ?? [])) {
        const applicationId = item.id === process.env.CIRCLE_PARCHASE_ID ? item.id : undefined
        const ticketId = item.id === process.env.TICKET_PARCHASE_ID ? item.id : undefined
        await firestore.collection('_payments').add({
          userId: 'なんかID',
          paymentType: bankTransfer,
          paymentId: undefined,
          bankTransferCode: 'なんかID',
          paymentAmount: item.amount_total,
          status: pending,
          applicationId,
          ticketId,
          createdAt: now.getTime(),
          updatedAt: now.getTime()
        })
      }
      break
    }

    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object as Stripe.Checkout.Session
      const payments = await collectPayments('どうにかして取得したuserId', pending)
      await updateStatus(payments, session.line_items?.data, paid, now)
      break
    }

    case 'checkout.session.async_payment_failed': {
      const session = event.data.object as Stripe.Checkout.Session
      const payments = await collectPayments('どうにかして取得したuserId', pending)
      await updateStatus(payments, session.line_items?.data, paymentFailure, now)
      break
    }

    case 'charge.refunded': {
      const session = event.data.object
      const payments = await collectPayments('どうにかして取得したuserId', paymentFailure)
      await updateStatus(payments, session.line_items?.data, refunded, now)
      break
    }
  }
  res.send(event.data.object)
})
