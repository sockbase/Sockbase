import * as FirestoreDB from 'firebase/firestore'
import { applicationHashIdConverter, paymentConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbasePaymentDocument } from 'sockbase'

interface IUsePayment {
  getPaymentIdByHashId: (hashId: string) => Promise<string>
  getPaymentsByUserId: (userId: string) => Promise<SockbasePaymentDocument[]>
  getPaymentAsync: (paymentId: string) => Promise<SockbasePaymentDocument>
}

const usePayment = (): IUsePayment => {
  const { getFirestore } = useFirebase()

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
        .filter((doc) => doc.exists())
        .map((doc) => doc.data())

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

  return {
    getPaymentIdByHashId,
    getPaymentsByUserId,
    getPaymentAsync
  }
}

export default usePayment
