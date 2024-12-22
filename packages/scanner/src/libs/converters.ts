import { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot, serverTimestamp } from 'firebase/firestore'
import type { SockbasePaymentDocument, SockbaseTicketHashIdDocument, SockbaseTicketMeta, SockbaseTicketUsedStatus, SockbaseTicketUserDocument } from 'sockbase'

export const ticketUserConverter: FirestoreDataConverter<SockbaseTicketUserDocument> = {
  toFirestore: (data: SockbaseTicketUserDocument) => ({
    usableUserId: data.usableUserId
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseTicketUserDocument => {
    const data = snapshot.data()
    return {
      hashId: snapshot.id,
      userId: data.userId,
      storeId: data.storeId,
      typeId: data.typeId,
      usableUserId: data.usableUserId,
      used: data.used,
      usedAt: data.usedAt ? new Date(data.usedAt.seconds * 1000) : null,
      isStandalone: data.isStandalone ?? false
    }
  }
}

export const ticketHashIdConverter: FirestoreDataConverter<SockbaseTicketHashIdDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseTicketHashIdDocument => {
    const data = snapshot.data()
    return {
      hashId: data.hashId,
      ticketId: data.ticketId,
      paymentId: data.paymentId
    }
  }
}

export const ticketMetaConverter: FirestoreDataConverter<SockbaseTicketMeta> = {
  toFirestore: (ticketMeta: SockbaseTicketMeta) => ({
    applicationStatus: ticketMeta.applicationStatus
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseTicketMeta => {
    const data = snapshot.data()
    return {
      applicationStatus: data.applicationStatus
    }
  }
}

export const ticketUsedStatusConverter: FirestoreDataConverter<SockbaseTicketUsedStatus> = {
  toFirestore: (usedStatus: SockbaseTicketUsedStatus) => ({
    used: usedStatus.used,
    usedAt: serverTimestamp()
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseTicketUsedStatus => {
    const data = snapshot.data()
    return {
      used: data.used,
      usedAt: data.usedAt ? new Date(data.usedAt.seconds * 1000) : null
    }
  }
}

export const paymentConverter: FirestoreDataConverter<SockbasePaymentDocument> =
  {
    toFirestore: (payment: SockbasePaymentDocument): DocumentData => ({
      status: payment.status
    }),
    fromFirestore: (snapshot: QueryDocumentSnapshot): SockbasePaymentDocument => {
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
          : null,
        paymentResult: payment.paymentResult ?? null
      }
    }
  }
