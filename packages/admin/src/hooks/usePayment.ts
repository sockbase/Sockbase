import { useCallback } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { paymentConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { PaymentStatus, SockbasePaymentDocument } from 'sockbase'

interface IUsePayment {
  getPaymentByIdAsync: (paymentId: string) => Promise<SockbasePaymentDocument>
  setPaymentStatusAsync: (paymentId: string, status: PaymentStatus) => Promise<void>
}

const usePayment = (): IUsePayment => {
  const { getFirestore } = useFirebase()
  const db = getFirestore()

  const getPaymentByIdAsync =
    useCallback(async (paymentId: string): Promise<SockbasePaymentDocument> => {
      const paymentRef = doc(db, `/_payments/${paymentId}`)
        .withConverter(paymentConverter)
      const paymentDoc = await getDoc(paymentRef)
      if (!paymentDoc.exists()) {
        throw new Error('payment not found')
      }
      const payment = paymentDoc.data()
      return payment
    }, [])

  const setPaymentStatusAsync =
    useCallback(async (paymentId: string, status: PaymentStatus): Promise<void> => {
      const paymentRef = doc(db, `/_payments/${paymentId}`)
        .withConverter(paymentConverter)
      await setDoc(paymentRef, { status }, { merge: true })
    }, [])

  return {
    getPaymentByIdAsync,
    setPaymentStatusAsync
  }
}

export default usePayment
