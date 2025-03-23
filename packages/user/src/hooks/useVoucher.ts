import { useCallback } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { voucherCodeConverter, voucherConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseVoucherCodeDocument, SockbaseVoucherDocument, VoucherAppliedAmount, VoucherTargetType } from 'sockbase'

interface IUseVoucher {
  getVoucherByCodeAsync: (targetType: VoucherTargetType, targetId: string, typeId: string, code: string) => Promise<{ voucher: SockbaseVoucherDocument, voucherCode: SockbaseVoucherCodeDocument } | null>
  calculatePaymentAmount: (price: number, voucherAmount: number | null | undefined) => VoucherAppliedAmount
}
const useVoucher = (): IUseVoucher => {
  const { getFirestore } = useFirebase()

  const db = getFirestore()

  const getVoucherByCodeAsync = useCallback(async (targetType: VoucherTargetType, targetId: string, typeId: string, code: string) => {
    const voucherCodeRef = doc(db, `voucherCodes/${code}`)
      .withConverter(voucherCodeConverter)
    const voucherCodeDoc = await getDoc(voucherCodeRef)
      .catch(err => {
        console.error(err)
        return null
      })

    const voucherCode = voucherCodeDoc?.data()
    if (!voucherCode) {
      return null
    }

    const voucherRef = doc(db, `vouchers/${voucherCode.voucherId}`)
      .withConverter(voucherConverter)
    const voucherDoc = await getDoc(voucherRef)
      .catch(err => {
        console.error(err)
        return null
      })

    const voucher = voucherDoc?.data()
    if (!voucher) {
      return null
    }

    if (voucher.targetType !== targetType || voucher.targetId !== targetId || (voucher.targetTypeId != null && voucher.targetTypeId !== typeId)) {
      return null
    }
    else if (voucher.usedCountLimit != null && voucher.usedCount >= voucher.usedCountLimit) {
      return null
    }

    return {
      voucher,
      voucherCode
    }
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
