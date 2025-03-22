import fs from 'fs'
import { getFirebaseAdmin } from './libs/FirebaseAdmin'
import dayjs from './libs/dayjs'
import { generateRandomCharacters } from './libs/random'

const admin = getFirebaseAdmin()
const db = admin.firestore()

const mock = []

const main = async () => {
  // const payments = await db.collection('_payments').get()
  // const paymentsWithId = payments.docs.map(doc => ({ ...doc.data(), id: doc.id }))
  // fs.mkdirSync('out', { recursive: true })
  // fs.writeFile('out/payments.json', JSON.stringify(paymentsWithId, null, 2), () => {})

  const targetPayments = mock.filter(p => !p.totalAmount)
    .map(p => ({
      id: p.id,
      hashId: generateHashId(new Date(p.createdAt._seconds * 1000)),
      purchasedAt: p.updatedAt ? new Date(p.updatedAt._seconds * 1000) : null,
      userId: p.userId,
      checkoutSessionId: p.checkoutSessionId ?? '',
      paymentIntentId: p.paymentIntentId ?? '',
      checkoutStatus: p.status === 0 ? 0 : 2,
      totalAmount: p.paymentAmount,
      voucherAmount: 0
    }))

  console.log(targetPayments)

  // db.runTransaction(async tx => {
  //   targetPayments.forEach(p => {
  //     const paymentRef = db.doc(`_payments/${p.id}`)
  //     tx.set(paymentRef, {
  //       hashId: p.hashId,
  //       purchasedAt: p.purchasedAt,
  //       checkoutSessionId: p.checkoutSessionId,
  //       paymentIntentId: p.paymentIntentId,
  //       checkoutStatus: p.checkoutStatus,
  //       totalAmount: p.totalAmount,
  //       voucherAmount: p.voucherAmount
  //     }, { merge: true })

  //     const paymentHashRef = db.doc(`_paymentHashes/${p.hashId}`)
  //     tx.set(paymentHashRef, { userId: p.userId, paymentId: p.id, hashId: p.hashId })
  //   })
  // })
}

main()
