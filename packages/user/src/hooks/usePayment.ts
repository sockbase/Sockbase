import { useCallback } from 'react'
import * as FirestoreDB from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { applicationHashIdConverter, paymentConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseCheckoutGetPayload, SockbaseCheckoutRequest, SockbaseCheckoutResult, SockbasePaymentDocument } from 'sockbase'

interface IUsePayment {
  getPaymentIdByHashId: (hashId: string) => Promise<string>
  getPaymentsByUserId: (userId: string) => Promise<SockbasePaymentDocument[]>
  getPaymentAsync: (paymentId: string) => Promise<SockbasePaymentDocument>
  getCheckoutSessionAsync: (sessionId: string) => Promise<SockbaseCheckoutResult | null>
  hoge: () => Promise<SockbaseCheckoutRequest>
}

const usePayment = (): IUsePayment => {
  const { getFirestore, getFunctions } = useFirebase()

  const getPaymentIdByHashId =
    async (hashId: string): Promise<string> => {
      const db = getFirestore()
      const hashRef = FirestoreDB.doc(db, `/_applicationHashIds/${hashId}`)
        .withConverter(applicationHashIdConverter)
      const hashDoc = await FirestoreDB.getDoc(hashRef)

      const hash = hashDoc.data()
      if (!hash) {
        throw new Error('hash not found')
      }

      return hash.paymentId
    }

  const getPaymentsByUserId =
    async (userId: string): Promise<SockbasePaymentDocument[]> => {
      const db = getFirestore()
      const paymentsRef = FirestoreDB.collection(db, '_payments')
        .withConverter(paymentConverter)

      const paymentsQuery = FirestoreDB.query(
        paymentsRef,
        FirestoreDB.where('userId', '==', userId)
      )
      const querySnapshot = await FirestoreDB.getDocs(paymentsQuery)
      const queryDocs = querySnapshot.docs
        .filter(doc => doc.exists())
        .map(doc => doc.data())

      return queryDocs
    }

  const getPaymentAsync =
    async (paymentId: string): Promise<SockbasePaymentDocument> => {
      const db = getFirestore()
      const paymentRef = FirestoreDB.doc(db, `/_payments/${paymentId}`)
        .withConverter(paymentConverter)
      const paymentDoc = await FirestoreDB.getDoc(paymentRef)
      if (!paymentDoc.exists()) {
        throw new Error('payment not found')
      }
      const payment = paymentDoc.data()
      return payment
    }

  const getCheckoutSessionAsync =
    useCallback(async (sessionId: string): Promise<SockbaseCheckoutResult | null> => {
      const functions = getFunctions()
      const getCheckoutFunction = httpsCallable<
        SockbaseCheckoutGetPayload,
        SockbaseCheckoutResult | null
      >(functions, 'checkout-getCheckoutBySessionId')

      const payload = {
        sessionId
      }

      const checkoutResult = await getCheckoutFunction(payload)
      return checkoutResult.data
    }, [])

  const hoge =
    useCallback(async (): Promise<SockbaseCheckoutRequest> => {
      const functions = getFunctions()
      const createCheckoutFunction = httpsCallable<
        void,
        SockbaseCheckoutRequest
      >(functions, 'checkout-hoge')

      const checkoutResult = await createCheckoutFunction()
      return checkoutResult.data
    }, [])

  return {
    getPaymentIdByHashId,
    getPaymentsByUserId,
    getPaymentAsync,
    getCheckoutSessionAsync,
    hoge
  }
}

export default usePayment
