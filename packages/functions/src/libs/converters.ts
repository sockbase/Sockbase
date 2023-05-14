import type * as types from 'packages/types/src'
import type * as firestore from 'firebase-admin/firestore'

export const paymentConverter: firestore.FirestoreDataConverter<types.SockbasePaymentDocument> = {
  toFirestore (payment: types.SockbasePaymentDocument): firestore.DocumentData {
    // SockbasePaymentDocumentはIDを含むので、それを除いた分をDocumentDataとする
    return {
      userId: payment.userId,
      paymentProductId: payment.paymentProductId,
      paymentType: payment.paymentType,
      paymentId: payment.paymentId,
      bankTransferCode: payment.bankTransferCode,
      paymentAmount: payment.paymentAmount,
      status: payment.status,
      applicationId: payment.applicationId,
      ticketId: payment.ticketId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt
    }
  },
  fromFirestore (
    snapshot: firestore.QueryDocumentSnapshot<types.SockbasePaymentDocument>
  ): types.SockbasePaymentDocument {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      userId: data.userId,
      paymentProductId: data.paymentProductId,
      paymentType: data.paymentType,
      paymentId: data.paymentId,
      bankTransferCode: data.bankTransferCode,
      paymentAmount: data.paymentAmount,
      status: data.status,
      applicationId: data.applicationId,
      ticketId: data.ticketId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }
  }
}

export const userConverter: firestore.FirestoreDataConverter<types.SockbaseAccountDocument> = {
  toFirestore (account: types.SockbaseAccountDocument): firestore.DocumentData {
    // SockbaseAccountDocumentはIDを含むので、それを除いた分をDocumentDataとする
    return {
      name: account.name,
      email: account.email,
      isEmailVerified: account.isEmailVerified,
      birthday: account.birthday,
      postalCode: account.postalCode,
      address: account.address,
      telephone: account.telephone
    }
  },
  fromFirestore (
    snapshot: firestore.QueryDocumentSnapshot<types.SockbaseAccountDocument>
  ): types.SockbaseAccountDocument {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      name: data.name,
      email: data.email,
      isEmailVerified: data.isEmailVerified,
      birthday: data.birthday,
      postalCode: data.postalCode,
      address: data.address,
      telephone: data.telephone
    }
  }
}
