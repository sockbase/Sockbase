import { useCallback } from 'react'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { voucherCodeConverter, voucherConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseVoucherCodeDocument, SockbaseVoucherDocument } from 'sockbase'

interface IUseVoucher {
  getVoucherCodesAsync: () => Promise<SockbaseVoucherCodeDocument[]>
  getVoucherAsync: (voucherId: string) => Promise<SockbaseVoucherDocument>
}
const useVoucher = (): IUseVoucher => {
  const { getFirestore } = useFirebase()

  const db = getFirestore()

  const getVoucherCodesAsync = useCallback(async () => {
    const voucherCodesRef = collection(db, 'voucherCodes')
      .withConverter(voucherCodeConverter)
    const voucherCodeDocs = await getDocs(voucherCodesRef)
    const voucherCodes = voucherCodeDocs.docs.map(doc => doc.data())

    return voucherCodes
  }, [])

  const getVoucherAsync = useCallback(async (voucherId: string) => {
    const voucherRef = doc(db, `vouchers/${voucherId}`).withConverter(voucherConverter)
    const voucherDoc = await getDoc(voucherRef)
    const voucher = voucherDoc.data()
    if (!voucher) {
      throw new Error('Voucher not found')
    }
    return voucher
  }, [])

  return {
    getVoucherCodesAsync,
    getVoucherAsync
  }
}

export default useVoucher
