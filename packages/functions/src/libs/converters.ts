import {
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot
} from 'firebase-admin/firestore'
import {
  type SockbaseApplicationOverviewDocument,
  type SockbaseAccountDocument,
  type SockbaseApplicationDocument,
  type SockbaseApplicationHashIdDocument,
  type SockbaseApplicationLinksDocument,
  type SockbaseEvent,
  type SockbaseInquiryDocument,
  type SockbaseInquiryMetaDocument,
  type SockbasePaymentDocument,
  type SockbaseStoreDocument,
  type SockbaseTicketDocument,
  type SockbaseTicketUsedStatus,
  type SockbaseTicketUserDocument
} from 'sockbase'

export const paymentConverter: FirestoreDataConverter<SockbasePaymentDocument> = {
  toFirestore: (payment: SockbasePaymentDocument): DocumentData => ({
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
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbasePaymentDocument => {
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

export const userConverter: FirestoreDataConverter<SockbaseAccountDocument> = {
  toFirestore: (account: SockbaseAccountDocument): DocumentData => ({
    name: account.name,
    email: account.email,
    birthday: account.birthday,
    postalCode: account.postalCode,
    address: account.address,
    telephone: account.telephone
  }),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<SockbaseAccountDocument>
  ): SockbaseAccountDocument => {
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

export const applicationConverter: FirestoreDataConverter<SockbaseApplicationDocument> = {
  toFirestore: (app: SockbaseApplicationDocument): DocumentData => ({
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
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseApplicationDocument => {
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

export const eventConverter: FirestoreDataConverter<SockbaseEvent> = {
  toFirestore: (event: SockbaseEvent): DocumentData => ({}),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseEvent => {
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

export const roleConverter: FirestoreDataConverter<{ role: number }> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot: QueryDocumentSnapshot) => {
    const data = snapshot.data()
    return {
      role: data.role
    }
  }
}

export const applicationHashIdConverter: FirestoreDataConverter<SockbaseApplicationHashIdDocument> = {
  toFirestore: (app: SockbaseApplicationHashIdDocument): DocumentData => ({}),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseApplicationHashIdDocument => {
    const hashDoc = snapshot.data()
    return {
      userId: hashDoc.userId,
      applicationId: hashDoc.applicationId,
      hashId: hashDoc.hashId,
      paymentId: hashDoc.paymentId,
      spaceId: hashDoc.spaceId,
      organizationId: hashDoc.organizationId,
      eventId: hashDoc.eventId
    }
  }
}

export const storeConverter: FirestoreDataConverter<SockbaseStoreDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseStoreDocument => {
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

export const ticketConverter: FirestoreDataConverter<SockbaseTicketDocument> = {
  toFirestore: (ticket: SockbaseTicketDocument) => ({
    storeId: ticket.storeId,
    typeId: ticket.typeId,
    paymentMethod: ticket.paymentMethod,
    userId: ticket.userId,
    createdAt: ticket.createdAt,
    updateAt: ticket.updatedAt,
    hashId: ticket.hashId,
    createdUserId: ticket.createdUserId
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseTicketDocument => {
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

export const ticketUsedStatusConverter: FirestoreDataConverter<SockbaseTicketUsedStatus> = {
  toFirestore: (usedStatus: SockbaseTicketUsedStatus) => ({
    used: usedStatus.used,
    usedAt: usedStatus.usedAt
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseTicketUsedStatus => {
    const ticketDoc = snapshot.data()
    return {
      used: ticketDoc.used,
      usedAt: ticketDoc.usedAt ? new Date(ticketDoc.usedAt.seconds * 1000) : null
    }
  }
}

export const ticketUserConverter: FirestoreDataConverter<SockbaseTicketUserDocument> = {
  toFirestore: (ticketUser: SockbaseTicketUserDocument) => ({
    // storeId: ticketUser.storeId,
    // typeId: ticketUser.typeId,
    // usableUserId: ticketUser.usableUserId,
    used: ticketUser.used,
    usedAt: ticketUser.usedAt
    // userId: ticketUser.userId
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseTicketUserDocument => {
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

export const inquiryConverter: FirestoreDataConverter<SockbaseInquiryDocument> = {
  toFirestore: (inquiry: SockbaseInquiryDocument) => ({
    status: inquiry.status,
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseInquiryDocument => {
    const inquiry = snapshot.data()
    return {
      id: snapshot.id,
      userId: inquiry.userId,
      inquiryType: inquiry.inquiryType,
      body: inquiry.body,
      status: inquiry.status,
      createdAt: inquiry.createdAt ? new Date(inquiry.createdAt.seconds * 1000) : null,
      updatedAt: inquiry.updatedAt ? new Date(inquiry.updatedAt.seconds * 1000) : null
    }
  }
}

export const inquiryMetaConverter: FirestoreDataConverter<SockbaseInquiryMetaDocument> = {
  toFirestore: (meta: SockbaseInquiryMetaDocument) => ({
    status: meta.status,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseInquiryMetaDocument => {
    const meta = snapshot.data()
    return {
      status: meta.status,
      createdAt: meta.createdAt ? new Date(meta.createdAt.seconds * 1000) : null,
      updatedAt: meta.updatedAt ? new Date(meta.updatedAt.seconds * 1000) : null
    }
  }
}

export const applicationLinksConverter: FirestoreDataConverter<SockbaseApplicationLinksDocument> = {
  toFirestore: (links: SockbaseApplicationLinksDocument) => ({
    userId: links.userId,
    applicationId: links.applicationId,
    twitterScreenName: links.twitterScreenName,
    pixivUserId: links.pixivUserId,
    websiteURL: links.websiteURL,
    menuURL: links.menuURL
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseApplicationLinksDocument => {
    const links = snapshot.data()
    return {
      id: snapshot.id,
      userId: links.userId,
      applicationId: links.applicationId,
      twitterScreenName: links.twitterScreenName,
      pixivUserId: links.pixivUserId,
      websiteURL: links.websiteURL,
      menuURL: links.menuURL
    }
  }
}

export const overviewConverter: FirestoreDataConverter<SockbaseApplicationOverviewDocument> = {
  toFirestore: (overview: SockbaseApplicationOverviewDocument) => ({
    userId: overview.userId,
    applicationId: overview.applicationId,
    description: overview.description,
    totalAmount: overview.totalAmount
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseApplicationOverviewDocument => {
    const overview = snapshot.data()
    return {
      id: snapshot.id,
      userId: overview.userId,
      applicationId: overview.applicationId,
      description: overview.description,
      totalAmount: overview.totalAmount
    }
  }
}
