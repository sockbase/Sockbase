import { useCallback } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { voucherConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseVoucherDocument } from 'sockbase'

interface IUseVoucher {
  getVouchersAsync: () => Promise<SockbaseVoucherDocument[]>
}
const useVoucher = (): IUseVoucher => {
  const { getFirestore } = useFirebase()

  const db = getFirestore()

  const getVouchersAsync = useCallback(async () => {
    const vouchersRef = collection(db, 'vouchers')
      .withConverter(voucherConverter)
    const vouchersDoc = await getDocs(vouchersRef)
    const vouchers = vouchersDoc.docs.map(doc => doc.data())
    return vouchers
  }, [])

  return {
    getVouchersAsync
  }
}

export default useVoucher
