import { useCallback } from 'react'
import * as FirestoreDB from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { applicationHashIdConverter, paymentConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseCheckoutGetPayload, SockbaseCheckoutRequest, SockbaseCheckoutResult, SockbasePaymentDocument, SockbasePaymentHashDocument } from 'sockbase'

interface IUsePayment {
  getPaymentIdByHashId: (hashId: string) => Promise<string>
  getPaymentsByUserId: (userId: string) => Promise<SockbasePaymentDocument[]>
  getPaymentAsync: (paymentId: string) => Promise<SockbasePaymentDocument>
  getPaymentHashAsync: (hashId: string) => Promise<SockbasePaymentHashDocument>
  getCheckoutSessionAsync: (sessionId: string) => Promise<SockbaseCheckoutResult | null>
  refreshCheckoutSessionAsync: (paymentId: string) => Promise<SockbaseCheckoutRequest>
}

const usePayment = (): IUsePayment => {
  const { getFirestore, getFunctions } = useFirebase()
  const db = getFirestore()

  const getPaymentIdByHashId =
    async (hashId: string): Promise<string> => {
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
      const paymentRef = FirestoreDB.doc(db, `/_payments/${paymentId}`)
        .withConverter(paymentConverter)
      const paymentDoc = await FirestoreDB.getDoc(paymentRef)
      if (!paymentDoc.exists()) {
        throw new Error('payment not found')
      }
      const payment = paymentDoc.data()
      return payment
    }

  const getPaymentHashAsync = async (hashId: string): Promise<SockbasePaymentHashDocument> => {
    const hashRef = FirestoreDB.doc(db, `/_paymentHashes/${hashId}`)
      .withConverter(applicationHashIdConverter)
    const hashDoc = await FirestoreDB.getDoc(hashRef)
    const hash = hashDoc.data()
    if (!hash) {
      throw new Error('hash not found')
    }
    return hash
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

  const refreshCheckoutSessionAsync =
    useCallback(async (paymentId: string): Promise<SockbaseCheckoutRequest> => {
      const functions = getFunctions()
      const refreshCheckoutSessionFunction = httpsCallable<
        { paymentId: string },
        SockbaseCheckoutRequest
      >(functions, 'checkout-refreshCheckoutSession')

      const checkoutResult = await refreshCheckoutSessionFunction({ paymentId })
      return checkoutResult.data
    }, [])

  return {
    getPaymentIdByHashId,
    getPaymentsByUserId,
    getPaymentAsync,
    getPaymentHashAsync,
    getCheckoutSessionAsync,
    refreshCheckoutSessionAsync
  }
}

export default usePayment
