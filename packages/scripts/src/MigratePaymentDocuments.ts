import fs from 'fs'
import { getFirebaseAdmin } from './libs/FirebaseAdmin'
import dayjs from './libs/dayjs'
import { generateRandomCharacters } from './libs/random'

const admin = getFirebaseAdmin()
const db = admin.firestore()

const generateHashId = (now: Date): string => {
  const codeDigit = 12
  const randomId = generateRandomCharacters(codeDigit, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  const formatedDateTime = dayjs(now).tz().format('MMDD')
  const hashId = `SP${formatedDateTime}${randomId}`
  return hashId
}

const mock = []

const main = async () => {
  // const payments = await db.collection('_payments').get()
  // const paymentsWithId = payments.docs.map(doc => ({ ...doc.data(), id: doc.id }))
  // fs.mkdirSync('out', { recursive: true })
  // fs.writeFile('out/payments.json', JSON.stringify(paymentsWithId, null, 2), () => {})

  // const targetPayments = mock.filter(p => p.status === 1 && p.paymentMethod === 1 && !p.updatedAt)
  const targetPayments = mock.filter(p => !p.voucherId)
    .map(p => ({
      id: p.id,
      hashId: generateHashId(new Date(p.createdAt._seconds * 1000)),
      purchasedAt: p.updatedAt ? new Date(p.updatedAt._seconds * 1000) : null,
      userId: p.userId,
      checkoutSessionId: p.checkoutSessionId ?? '',
      paymentIntentId: p.paymentIntentId ?? '',
      checkoutStatus: p.status === 0 ? 0 : 2,
      totalAmount: Number(p.paymentAmount),
      voucherAmount: 0,
      voucherId: null
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
  //       paymentAmount: p.totalAmount,
  //       totalAmount: p.totalAmount,
  //       voucherAmount: p.voucherAmount,
  //       voucherId: p.voucherId
  //     }, { merge: true })

  //   const paymentHashRef = db.doc(`_paymentHashes/${p.hashId}`)
  //   tx.set(paymentHashRef, { userId: p.userId, paymentId: p.id, hashId: p.hashId })
  // })
  // })
}

main()
