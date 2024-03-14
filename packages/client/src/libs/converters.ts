import {
  serverTimestamp
} from 'firebase/firestore'
import type {
  DocumentData,
  SnapshotOptions,
  FirestoreDataConverter,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import type {
  SockbaseApplicationDocument,
  SockbaseApplicationMeta,
  SockbaseApplicationHashIdDocument,
  SockbaseApplicationLinksDocument,
  SockbaseSpaceDocument,
  SockbaseApplicationOverviewDocument,
  SockbaseEventDocument,
  SockbaseSpaceHashDocument,
  SockbaseStoreDocument,
  SockbaseTicketDocument,
  SockbaseTicketHashIdDocument,
  SockbaseTicketMeta,
  SockbaseTicketUsedStatus,
  SockbaseTicketUserDocument
} from 'sockbase'

export const applicationHashIdConverter: FirestoreDataConverter<SockbaseApplicationHashIdDocument> = {
  toFirestore: (app: SockbaseApplicationHashIdDocument): DocumentData => ({
    spaceId: app.spaceId
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): SockbaseApplicationHashIdDocument => {
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

export const applicationConverter: FirestoreDataConverter<SockbaseApplicationDocument> = {
  toFirestore: (app: SockbaseApplicationDocument): DocumentData => ({}),
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): SockbaseApplicationDocument => {
    const app = snapshot.data()
    return {
      id: snapshot.id,
      hashId: app.hashId,
      userId: app.userId,
      eventId: app.eventId,
      spaceId: app.spaceId,
      circle: app.circle,
      overview: app.overview,
      unionCircleId: app.unionCircleId,
      petitCode: app.petitCode,
      paymentMethod: app.paymentMethod,
      remarks: app.remarks,
      createdAt: app.createdAt ? new Date(app.createdAt.seconds * 1000) : null,
      updatedAt: app.updatedAt ? new Date(app.updatedAt.seconds * 1000) : null
    }
  }
}

export const applicationMetaConverter: FirestoreDataConverter<SockbaseApplicationMeta> = {
  toFirestore: (meta: SockbaseApplicationMeta) => ({
    applicationStatus: meta.applicationStatus
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): SockbaseApplicationMeta => {
    const meta = snapshot.data()
    return {
      applicationStatus: meta.applicationStatus
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

export const eventConverter: FirestoreDataConverter<SockbaseEventDocument> = {
  toFirestore: (event: SockbaseEventDocument): DocumentData => ({
    eventName: event.eventName,
    eventWebURL: event.eventWebURL,
    descriptions: event.descriptions,
    rules: event.rules,
    spaces: event.spaces,
    genres: event.genres,
    schedules: event.schedules,
    _organization: event._organization,
    permissions: event.permissions,
    isPublic: event.isPublic
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): SockbaseEventDocument => {
    const event = snapshot.data() as SockbaseEventDocument
    return {
      id: snapshot.id,
      eventName: event.eventName,
      eventWebURL: event.eventWebURL,
      descriptions: event.descriptions,
      rules: event.rules,
      spaces: event.spaces
        .sort((a, b) => a.price - b.price),
      genres: event.genres,
      schedules: event.schedules,
      _organization: event._organization,
      permissions: event.permissions,
      isPublic: event.isPublic
    }
  }
}

export const spaceConverter: FirestoreDataConverter<SockbaseSpaceDocument> = {
  toFirestore: (space: SockbaseSpaceDocument) => ({
    eventId: space.eventId,
    spaceGroupOrder: space.spaceGroupOrder,
    spaceOrder: space.spaceOrder,
    spaceName: space.spaceName
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseSpaceDocument => {
    const space = snapshot.data()
    return {
      id: snapshot.id,
      eventId: space.eventId,
      spaceGroupOrder: space.spaceGroupOrder,
      spaceOrder: space.spaceOrder,
      spaceName: space.spaceName
    }
  }
}

export const spaceHashConverter: FirestoreDataConverter<SockbaseSpaceHashDocument> = {
  toFirestore: (spaceHash: SockbaseSpaceHashDocument) => ({
    eventId: spaceHash.eventId
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseSpaceHashDocument => {
    const spaceHash = snapshot.data()
    return {
      id: snapshot.id,
      eventId: spaceHash.eventId
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

export const storeConverter: FirestoreDataConverter<SockbaseStoreDocument> = {
  toFirestore: (store: SockbaseStoreDocument): DocumentData => ({
    storeName: store.storeName,
    storeWebURL: store.storeWebURL,
    descriptions: store.descriptions,
    rules: store.rules,
    schedules: store.schedules,
    _organization: store._organization,
    types: store.types,
    isPublic: store.isPublic
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseStoreDocument => {
    const store = snapshot.data()
    return {
      id: snapshot.id,
      storeName: store.storeName,
      storeWebURL: store.storeWebURL,
      descriptions: store.descriptions,
      rules: store.rules,
      schedules: store.schedules,
      _organization: store._organization,
      types: store.types,
      isPublic: store.isPublic
    }
  }
}

export const ticketConverter: FirestoreDataConverter<SockbaseTicketDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot
  ): SockbaseTicketDocument => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      userId: data.userId,
      storeId: data.storeId,
      typeId: data.typeId,
      paymentMethod: data.paymentMethod,
      paymentProductId: data.paymentProductId,
      createdAt: data.createdAt
        ? new Date(data.createdAt.seconds * 1000)
        : null,
      updatedAt: data.updatedAt
        ? new Date(data.updatedAt.seconds * 1000)
        : null,
      hashId: data.hashId,
      createdUserId: data.createdUserId
    }
  }
}

export const ticketMetaConverter: FirestoreDataConverter<SockbaseTicketMeta> = {
  toFirestore: (ticketMeta: SockbaseTicketMeta) => ({
    applicationStatus: ticketMeta.applicationStatus
  }),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot
  ): SockbaseTicketMeta => {
    const data = snapshot.data()
    return {
      applicationStatus: data.applicationStatus
    }
  }
}

export const ticketUserConverter: FirestoreDataConverter<SockbaseTicketUserDocument> = {
  toFirestore: (data: SockbaseTicketUserDocument) => ({
    usableUserId: data.usableUserId
  }),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot
  ): SockbaseTicketUserDocument => {
    const data = snapshot.data()
    return {
      hashId: snapshot.id,
      userId: data.userId,
      storeId: data.storeId,
      typeId: data.typeId,
      usableUserId: data.usableUserId,
      used: data.used,
      usedAt: data.usedAt ? new Date(data.usedAt.seconds * 1000) : null
    }
  }
}

export const ticketUsedStatusConverter: FirestoreDataConverter<SockbaseTicketUsedStatus> = {
  toFirestore: (usedStatus: SockbaseTicketUsedStatus) => ({
    used: usedStatus.used,
    usedAt: serverTimestamp()
  }),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot
  ): SockbaseTicketUsedStatus => {
    const data = snapshot.data()
    return {
      used: data.used,
      usedAt: data.usedAt ? new Date(data.usedAt.seconds * 1000) : null
    }
  }
}

export const ticketHashIdConverter: FirestoreDataConverter<SockbaseTicketHashIdDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (
    snapshot: QueryDocumentSnapshot
  ): SockbaseTicketHashIdDocument => {
    const data = snapshot.data()
    return {
      hashId: data.hashId,
      ticketId: data.ticketId,
      paymentId: data.paymentId
    }
  }
}
