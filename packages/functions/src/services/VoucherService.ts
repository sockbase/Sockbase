import { FieldValue } from 'firebase-admin/firestore'
import { VoucherTargetType } from 'sockbase'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { voucherConverter } from '../libs/converters'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()

const useVoucherAsync = async (targetType: VoucherTargetType, targetId: string, targetTypeId: string, voucherId: string) => {
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

const getVoucherAsync = async (voucherId: string) => {
  const voucherDoc = await firestore
    .doc(`vouchers/${voucherId}`)
    .withConverter(voucherConverter)
    .get()
  const voucher = voucherDoc.data()
  if (!voucher) {
    return null
  }
  return voucher
}

export {
  useVoucherAsync,
  getVoucherAsync
}
