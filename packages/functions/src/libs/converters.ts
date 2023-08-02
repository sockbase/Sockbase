import type * as types from 'sockbase'
import type * as firestore from 'firebase-admin/firestore'

interface ApplicationHashIdDocument {
  applicationId: string
  hashId: string
  paymentId: string
}

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
  fromFirestore: (snapshot: firestore.QueryDocumentSnapshot): types.SockbasePaymentDocument => {
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
      genres: event.genres,
      schedules: {
        startApplication: event.schedules.startApplication,
        endApplication: event.schedules.endApplication,
        fixedApplication: event.schedules.fixedApplication,
        publishSpaces: event.schedules.publishSpaces,
        startEvent: event.schedules.startEvent,
        endEvent: event.schedules.endEvent
      },
      _organization: {
        id: event._organization.id,
        name: '',
        contactUrl: ''
      },
      permissions: event.permissions
    }
  }
}

export const roleConverter: firestore.FirestoreDataConverter<{ role: number }> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot: firestore.QueryDocumentSnapshot) => {
    const data = snapshot.data()
    return {
      role: data.role
    }
  }
}

export const applicationHashIdConverter: firestore.FirestoreDataConverter<ApplicationHashIdDocument> = {
  toFirestore: (app: ApplicationHashIdDocument): firestore.DocumentData => ({}),
  fromFirestore: (snapshot: firestore.QueryDocumentSnapshot): ApplicationHashIdDocument => {
    const hashDoc = snapshot.data()
    return {
      applicationId: hashDoc.applicationId,
      hashId: hashDoc.hashId,
      paymentId: hashDoc.paymentId
    }
  }
}

export const storeConverter: firestore.FirestoreDataConverter<types.SockbaseStoreDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot: firestore.QueryDocumentSnapshot): types.SockbaseStoreDocument => {
    const storeDoc = snapshot.data()
    return {
      id: snapshot.id,
      storeName: storeDoc.storeName,
      storeWebURL: storeDoc.websiteURL,
      descriptions: storeDoc.descriptions,
      rules: storeDoc.rules,
      types: storeDoc.types,
      schedules: storeDoc.schedules,
      _organization: storeDoc._organization
    }
  }
}

export const ticketConverter: firestore.FirestoreDataConverter<types.SockbaseTicketDocument> = {
  toFirestore: (ticket: types.SockbaseTicketDocument) => ({
    storeId: ticket.storeId,
    typeId: ticket.typeId,
    paymentMethod: ticket.paymentMethod,
    userId: ticket.userId,
    createdAt: ticket.createdAt,
    updateAt: ticket.updatedAt,
    hashId: ticket.hashId,
    createdUserId: ticket.createdUserId
  }),
  fromFirestore: (snapshot: firestore.QueryDocumentSnapshot): types.SockbaseTicketDocument => {
    const ticketDoc = snapshot.data()
    return {
      id: snapshot.id,
      storeId: ticketDoc.storeId,
      typeId: ticketDoc.typeId,
      paymentMethod: ticketDoc.paymentMethod,
      userId: ticketDoc.userId,
      createdAt: ticketDoc.createdAt ? new Date(ticketDoc.createdAt.seconds * 1000) : null,
      updatedAt: ticketDoc.updatedAt ? new Date(ticketDoc.updatedAt.seconds * 1000) : null,
      hashId: ticketDoc.hashId,
      createdUserId: ticketDoc.createdUserId
    }
  }
}

export const ticketUsedStatusConverter: firestore.FirestoreDataConverter<types.SockbaseTicketUsedStatus> = {
  toFirestore: (usedStatus: types.SockbaseTicketUsedStatus) => ({
    used: usedStatus.used,
    usedAt: usedStatus.usedAt
  }),
  fromFirestore: (snapshot: firestore.QueryDocumentSnapshot): types.SockbaseTicketUsedStatus => {
    const ticketDoc = snapshot.data()
    return {
      used: ticketDoc.used,
      usedAt: ticketDoc.usedAt ? new Date(ticketDoc.usedAt.seconds * 1000) : null
    }
  }
}

export const ticketUserConverter: firestore.FirestoreDataConverter<types.SockbaseTicketUserDocument> = {
  toFirestore: (ticketUser: types.SockbaseTicketUserDocument) => ({
    storeId: ticketUser.storeId,
    typeId: ticketUser.typeId,
    usableUserId: ticketUser.usableUserId,
    used: ticketUser.used,
    usedAt: ticketUser.usedAt,
    userId: ticketUser.userId
  }),
  fromFirestore: (snapshot: firestore.QueryDocumentSnapshot): types.SockbaseTicketUserDocument => {
    const ticketUserDoc = snapshot.data()
    return {
      hashId: snapshot.id,
      storeId: ticketUserDoc.storeId,
      typeId: ticketUserDoc.typeId,
      usableUserId: ticketUserDoc.usableUserId,
      used: ticketUserDoc.used,
      usedAt: ticketUserDoc.usedAt ? new Date(ticketUserDoc.usedAt.seconds * 1000) : null,
      userId: ticketUserDoc.userId
    }
  }
}
