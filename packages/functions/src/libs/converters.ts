import type * as types from 'packages/types/src'
import type * as firestore from 'firebase-admin/firestore'

export const paymentConverter: firestore.FirestoreDataConverter<types.SockbasePaymentDocument> = {
  toFirestore: (payment: types.SockbasePaymentDocument): firestore.DocumentData => ({
    userId: payment.userId,
    paymentProductId: payment.paymentProductId,
    paymentMethod: payment.paymentMethod,
    paymentId: payment.paymentId,
    bankTransferCode: payment.bankTransferCode,
    paymentAmount: payment.paymentAmount,
    status: payment.status,
    applicationId: payment.applicationId,
    ticketId: payment.ticketId,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt
  }),
  fromFirestore: (snapshot: firestore.QueryDocumentSnapshot<types.SockbasePaymentDocument>): types.SockbasePaymentDocument => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      userId: data.userId,
      paymentProductId: data.paymentProductId,
      paymentMethod: data.paymentMethod,
      paymentId: data.paymentId,
      bankTransferCode: data.bankTransferCode,
      paymentAmount: data.paymentAmount,
      status: data.status,
      applicationId: data.applicationId,
      ticketId: data.ticketId,
      createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : null,
      updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : null
    }
  }
}

export const userConverter: firestore.FirestoreDataConverter<types.SockbaseAccountDocument> = {
  toFirestore: (account: types.SockbaseAccountDocument): firestore.DocumentData => ({
    name: account.name,
    email: account.email,
    isEmailVerified: account.isEmailVerified,
    birthday: account.birthday,
    postalCode: account.postalCode,
    address: account.address,
    telephone: account.telephone
  }),
  fromFirestore: (
    snapshot: firestore.QueryDocumentSnapshot<types.SockbaseAccountDocument>
  ): types.SockbaseAccountDocument => {
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

export const applicationConverter: firestore.FirestoreDataConverter<types.SockbaseApplicationDocument> = {
  toFirestore: (app: types.SockbaseApplicationDocument): firestore.DocumentData => ({
    hashId: app.hashId,
    userId: app.userId,
    eventId: app.eventId,
    spaceId: app.spaceId,
    circle: {
      name: app.circle.name,
      yomi: app.circle.yomi,
      penName: app.circle.penName,
      penNameYomi: app.circle.penNameYomi,
      hasAdult: app.circle.hasAdult,
      genre: app.circle.genre
    },
    overview: {
      description: app.overview.description,
      totalAmount: app.overview.totalAmount
    },
    unionCircleId: app.unionCircleId,
    petitCode: app.petitCode,
    paymentMethod: app.paymentMethod,
    remarks: app.remarks,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt
  }),
  fromFirestore: (snapshot: firestore.QueryDocumentSnapshot): types.SockbaseApplicationDocument => {
    const app = snapshot.data()
    return {
      hashId: app.hashId,
      userId: app.userId,
      eventId: app.eventId,
      spaceId: app.spaceId,
      circle: {
        name: app.circle.name,
        yomi: app.circle.yomi,
        penName: app.circle.penName,
        penNameYomi: app.circle.penNameYomi,
        hasAdult: app.hasAdult,
        genre: app.genre
      },
      overview: {
        description: app.overview.description,
        totalAmount: app.overview.totalAmount
      },
      unionCircleId: app.unionCircleId,
      petitCode: app.petitCode,
      paymentMethod: app.paymentMethod,
      remarks: app.remarks,
      createdAt: app.createdAt ? new Date(app.createdAt.seconds * 1000) : null,
      updatedAt: app.updatedAt ? new Date(app.updatedAt.seconds * 1000) : null
    }
  }
}

export const eventConverter: firestore.FirestoreDataConverter<types.SockbaseEvent> = {
  toFirestore: (event: types.SockbaseEvent): firestore.DocumentData => ({}),
  fromFirestore: (snapshot: firestore.QueryDocumentSnapshot): types.SockbaseEvent => {
    const event = snapshot.data()
    return {
      eventName: event.eventName,
      descriptions: event.descriptions,
      rules: event.rules,
      spaces: event.spaces,
      schedules: {
        startApplication: event.schedules.startApplication,
        endApplication: event.schedules.endApplication,
        publishSpaces: event.schedules.publishSpaces,
        startEvent: event.schedules.startEvent,
        endEvent: event.schedules.endEvent
      },
      _organization: {
        id: event._organization.id,
        name: '',
        contactUrl: ''
      }
    }
  }
}
