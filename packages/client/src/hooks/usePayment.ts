import * as FirestoreDB from 'firebase/firestore'
import type { SockbasePaymentDocument } from 'sockbase'

import useFirebase from './useFirebase'

interface ApplicationHashIdDocument {
  applicationId: string
  hashId: string
  paymentId: string
}

const applicationHashIdConverter: FirestoreDB.FirestoreDataConverter<ApplicationHashIdDocument> =
  {
    toFirestore: (
      app: ApplicationHashIdDocument
    ): FirestoreDB.DocumentData => ({}),
    fromFirestore: (
      snapshot: FirestoreDB.QueryDocumentSnapshot,
      options: FirestoreDB.SnapshotOptions
    ): ApplicationHashIdDocument => {
      const hashDoc = snapshot.data()
      return {
        applicationId: hashDoc.applicationId,
        hashId: hashDoc.hashId,
        paymentId: hashDoc.paymentId
      }
    }
  }

const paymentConverter: FirestoreDB.FirestoreDataConverter<SockbasePaymentDocument> =
  {
    toFirestore: (
      payment: SockbasePaymentDocument
    ): FirestoreDB.DocumentData => ({}),
    fromFirestore: (
      snapshot: FirestoreDB.QueryDocumentSnapshot,
      options: FirestoreDB.SnapshotOptions
    ): SockbasePaymentDocument => {
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
        createdAt: payment.createdAt
          ? new Date(payment.createdAt.seconds * 1000)
          : null,
        updatedAt: payment.updatedAt
          ? new Date(payment.updatedAt.seconds * 1000)
          : null
      }
    }
  }

interface IUsePayment {
  getPaymentIdByHashId: (hashId: string) => Promise<string>
  getPaymentsByUserId: (userId: string) => Promise<SockbasePaymentDocument[]>
  getPaymentAsync: (paymentId: string) => Promise<SockbasePaymentDocument>
}

const usePayment = (): IUsePayment => {
  const { getFirestore } = useFirebase()

  const getPaymentIdByHashId = async (hashId: string): Promise<string> => {
    const db = getFirestore()
    const hashRef = FirestoreDB.doc(
      db,
      `/_applicationHashIds/${hashId}`
    ).withConverter(applicationHashIdConverter)
    const hashDoc = await FirestoreDB.getDoc(hashRef)

    const hash = hashDoc.data()
    if (!hash) {
      throw new Error('hash not found')
    }

    return hash.paymentId
  }

  const getPaymentsByUserId = async (
    userId: string
  ): Promise<SockbasePaymentDocument[]> => {
    const db = getFirestore()
    const paymentsRef = FirestoreDB.collection(db, '_payments').withConverter(
      paymentConverter
    )

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

  const getPaymentAsync = async (
    paymentId: string
  ): Promise<SockbasePaymentDocument> => {
    const db = getFirestore()
    const paymentRef = FirestoreDB.doc(
      db,
      `/_payments/${paymentId}`
    ).withConverter(paymentConverter)
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
