import { FieldValue } from 'firebase-admin/firestore'
import { VoucherTargetType } from 'sockbase'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { voucherConverter } from '../libs/converters'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()

const useVoucherByCodeAsync = async (targetType: VoucherTargetType, targetId: string, targetTypeId: string, voucherId: string) => {
  const voucherRef = firestore.doc(`vouchers/${voucherId}`)
  const useResult = await firestore.runTransaction(async tx => {
    const voucherDoc = await tx.get(voucherRef)
    const voucher = voucherDoc.data()
    if (!voucher) {
      return false
    }
    else if (voucher.targetType !== targetType || voucher.targetId !== targetId || (voucher.targetTypeId !== null && voucher.targetTypeId !== targetTypeId)) {
      return false
    }
    else if (voucher.usedCountLimit !== null && voucher.usedCount >= voucher.usedCountLimit) {
      return false
    }

    tx.update(voucherRef, { usedCount: FieldValue.increment(1) })
    return true
  })

  if (!useResult) {
    return false
  }

  return true
}

const getVoucherByCodeAsync = async (code: string) => {
  const vouchersRef = firestore.collection('vouchers')
    .withConverter(voucherConverter)
  const vouchersSnapshot = await vouchersRef
    .where('voucherCode', '==', code)
    .get()
  const voucherDocs = vouchersSnapshot.docs
    .map(v => v.data())
  if (voucherDocs.length !== 1) {
    return null
  }

  return voucherDocs[0]
}

export {
  useVoucherByCodeAsync,
  getVoucherByCodeAsync
}
