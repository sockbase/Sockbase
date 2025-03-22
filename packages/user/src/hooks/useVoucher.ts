import { useCallback } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { voucherConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseVoucherDocument, VoucherAppliedAmount, VoucherTargetType } from 'sockbase'

interface IUseVoucher {
  getVoucherByCodeAsync: (targetType: VoucherTargetType, targetId: string, typeId: string, code: string) => Promise<SockbaseVoucherDocument | null>
  calculatePaymentAmount: (price: number, voucherAmount: number | null | undefined) => VoucherAppliedAmount
}
const useVoucher = (): IUseVoucher => {
  const { getFirestore } = useFirebase()

  const db = getFirestore()

  const getVoucherByCodeAsync = useCallback(async (targetType: VoucherTargetType, targetId: string, typeId: string, code: string) => {
    const vouchersRef = collection(db, 'vouchers')
      .withConverter(voucherConverter)
    const voucherQuery = query(vouchersRef, where('voucherCode', '==', code))
    const voucherSnapshot = await getDocs(voucherQuery)
      .catch(err => {
        console.error(err)
        return null
      })
    if (voucherSnapshot === null) {
      return null
    }

    const voucherDocs = voucherSnapshot.docs
      .map(doc => doc.data())
    if (voucherDocs.length !== 1) {
      return null
    }

    const voucher = voucherDocs[0]
    if (voucher.targetType !== targetType || voucher.targetId !== targetId || (voucher.targetTypeId != null && voucher.targetTypeId !== typeId)) {
      return null
    }
    else if (voucher.usedCountLimit != null && voucher.usedCount >= voucher.usedCountLimit) {
      return null
    }

    return voucher
  }, [])

  const calculatePaymentAmount = useCallback((price: number, voucherAmount: number | null | undefined): VoucherAppliedAmount => {
    if (voucherAmount === undefined) {
      return {
        spaceAmount: price,
        voucherAmount: null,
        paymentAmount: price
      }
    }
    const discountAmount = voucherAmount ?? price
    return {
      spaceAmount: price,
      voucherAmount: discountAmount,
      paymentAmount: price - discountAmount
    }
  }, [])

  return {
    getVoucherByCodeAsync,
    calculatePaymentAmount
  }
}

export default useVoucher
