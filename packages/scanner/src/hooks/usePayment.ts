import { useCallback } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { paymentConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbasePaymentDocument } from 'sockbase'

interface IUsePayment {
  getPaymentByIdAsync: (paymentId: string) => Promise<SockbasePaymentDocument>
}

const usePayment = (): IUsePayment => {
  const { getFirestore } = useFirebase()
  const db = getFirestore()

  const getPaymentByIdAsync =
    useCallback(async (paymentId: string): Promise<SockbasePaymentDocument> => {
      const paymentRef = doc(db, '_payments', paymentId)
        .withConverter(paymentConverter)
      const paymentDoc = await getDoc(paymentRef)
      if (!paymentDoc.exists()) {
        throw new Error('payment not found')
      }
      const payment = paymentDoc.data()
      return payment
    }, [])

  return {
    getPaymentByIdAsync
  }
}

export default usePayment
