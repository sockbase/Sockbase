import * as FirestoreDB from 'firebase/firestore'
import type { SockbasePaymentDocument } from 'sockbase'

import useFirebase from './useFirebase'
import { useCallback } from 'react'

const paymentConverter: FirestoreDB.FirestoreDataConverter<SockbasePaymentDocument> = {
  toFirestore: (payment: SockbasePaymentDocument): FirestoreDB.DocumentData => ({}),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot, options: FirestoreDB.SnapshotOptions): SockbasePaymentDocument => {
    const payment = snapshot.data()
    return {
      userId: payment.userId,
      paymentProductId: payment.paymentProductId,
      paymentMethod: payment.paymentMethod,
      paymentAmount: payment.paymentAmount,
      bankTransferCode: payment.bankTransferCode,
      applicationId: payment.applicationId,
      ticketId: payment.ticketId,
      id: snapshot.id,
      paymentId: payment.paymentId,
      status: payment.status,
      createdAt: payment.createdAt ? new Date(payment.createdAt.seconds * 1000) : null,
      updatedAt: payment.updatedAt ? new Date(payment.updatedAt.seconds * 1000) : null
    }
  }
}

interface IUsePayment {
  getPaymentsByUserId: (userId: string) => Promise<SockbasePaymentDocument[]>
  getPayment: (paymentId: string) => Promise<SockbasePaymentDocument>
  getPaymentByApplicationId: (appId: string) => Promise<SockbasePaymentDocument | null | undefined>
}
const usePayment: () => IUsePayment =
  () => {
    const { getFirestore, user } = useFirebase()

    const getPaymentsByUserId: (userId: string) => Promise<SockbasePaymentDocument[]> =
      async (userId) => {
        const db = getFirestore()
        const paymentsRef = FirestoreDB.collection(db, '_payments')
          .withConverter(paymentConverter)

        const paymentsQuery = FirestoreDB.query(paymentsRef, FirestoreDB.where('userId', '==', userId))
        const querySnapshot = await FirestoreDB.getDocs(paymentsQuery)
        const queryDocs = querySnapshot.docs
          .filter(doc => doc.exists())
          .map(doc => doc.data())

        return queryDocs
      }

    const getPayment: (paymentId: string) => Promise<SockbasePaymentDocument> =
      async (paymentId) => {
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

    const getPaymentByApplicationId: (appId: string) => Promise<SockbasePaymentDocument | null | undefined> =
      useCallback(async (appId) => {
        if (!user) return undefined

        const db = getFirestore()
        const paymentsRef = FirestoreDB.collection(db, '_payments')
          .withConverter(paymentConverter)

        const paymentsQuery = FirestoreDB.query(paymentsRef,
          FirestoreDB.where('userId', '==', user.uid),
          FirestoreDB.where('applicationId', '==', appId)
        )
        const querySnapshot = await FirestoreDB.getDocs(paymentsQuery)
        const queryDocs = querySnapshot.docs
          .filter(doc => doc.exists())
          .map(doc => doc.data())

        return queryDocs.length === 1 ? queryDocs[0] : null
      }, [user])

    return {
      getPaymentsByUserId,
      getPayment,
      getPaymentByApplicationId
    }
  }

export default usePayment
