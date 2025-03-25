import { useCallback } from 'react'
import { collection, doc, getDoc, getDocs, query, runTransaction, setDoc, where } from 'firebase/firestore'
import { voucherCodeConverter, voucherConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type {
  SockbaseVoucher,
  SockbaseVoucherCodeDocument,
  SockbaseVoucherDocument
} from 'sockbase'

interface IUseVoucher {
  getVoucherCodesAsync: () => Promise<SockbaseVoucherCodeDocument[]>
  getVoucherCodeByIdAsync: (voucherId: string) => Promise<SockbaseVoucherCodeDocument>
  getVoucherAsync: (voucherId: string) => Promise<SockbaseVoucherDocument>
  createVoucherAsync: (voucherCode: string, voucher: SockbaseVoucher) => Promise<void>
  updateVoucherAsync: (voucherId: string, voucher: SockbaseVoucher) => Promise<void>
  deleteVoucherByCodeAsync: (voucherCode: string) => Promise<void>
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

  const getVoucherCodeByIdAsync = useCallback(async (voucherId: string) => {
    const voucherCodeRef = collection(db, 'voucherCodes')
      .withConverter(voucherCodeConverter)
    const voucherQuery = query(voucherCodeRef, where('voucherId', '==', voucherId))
    const voucherCodeDocs = await getDocs(voucherQuery)
    const voucherCodes = voucherCodeDocs.docs.map(doc => doc.data())
    if (voucherCodes.length === 0) {
      throw new Error('Voucher code not found')
    }
    const voucherCode = voucherCodes[0]
    return voucherCode
  }, [])

  const getVoucherAsync = useCallback(async (voucherId: string) => {
    const voucherRef = doc(db, `vouchers/${voucherId}`)
      .withConverter(voucherConverter)
    const voucherDoc = await getDoc(voucherRef)
    const voucher = voucherDoc.data()
    if (!voucher) {
      throw new Error(`Voucher not found (${voucherId})`)
    }
    return voucher
  }, [])

  const createVoucherAsync = useCallback(async (voucherCode: string, voucher: SockbaseVoucher) => {
    const vouchersRef = collection(db, 'vouchers')
      .withConverter(voucherConverter)
    const voucherRef = doc(vouchersRef)
    const voucherCodeRef = doc(db, 'voucherCodes', voucherCode)
    await runTransaction(db, async tx => {
      const voucherCodeDoc = await tx.get(voucherCodeRef)
      if (voucherCodeDoc.exists()) {
        throw new Error('Voucher code already exists')
      }

      tx.set(voucherRef, {
        ...voucher,
        id: '',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      tx.set(voucherCodeRef, { voucherId: voucherRef.id })
    })
  }, [])

  const updateVoucherAsync = useCallback(async (voucherId: string, voucher: SockbaseVoucher) => {
    const voucherRef = doc(db, `vouchers/${voucherId}`)
    await setDoc(voucherRef, {
      amount: voucher.amount,
      targetType: voucher.targetType,
      targetId: voucher.targetId,
      targetTypeId: voucher.targetTypeId,
      usedCountLimit: voucher.usedCountLimit,
      updatedAt: new Date()
    }, { merge: true })
  }, [])

  const deleteVoucherByCodeAsync = useCallback(async (voucherCode: string) => {
    await runTransaction(db, async tx => {
      const voucherCodeRef = doc(db, `voucherCodes/${voucherCode}`)
        .withConverter(voucherCodeConverter)
      const voucherCodeDoc = await tx.get(voucherCodeRef)
      if (!voucherCodeDoc.exists()) {
        throw new Error('Voucher code not found')
      }

      const voucherId = voucherCodeDoc.data().voucherId
      const voucherRef = doc(db, `vouchers/${voucherId}`)

      tx.delete(voucherCodeRef)
      tx.delete(voucherRef)
    })
  }, [])

  return {
    getVoucherCodesAsync,
    getVoucherCodeByIdAsync,
    getVoucherAsync,
    createVoucherAsync,
    updateVoucherAsync,
    deleteVoucherByCodeAsync
  }
}

export default useVoucher
