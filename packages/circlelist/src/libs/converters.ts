import type { FirestoreDataConverter } from 'firebase-admin/firestore'
import type {
  SockbaseApplicationDocument,
  SockbaseApplicationHashIdDocument,
  SockbaseApplicationLinksDocument,
  SockbaseApplicationMeta,
  SockbaseCircleListControlDocument,
  SockbaseEventDocument,
  SockbaseSpaceDocument
} from 'sockbase'

export const circleListControlConverter: FirestoreDataConverter<SockbaseCircleListControlDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot) => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      eventId: data.eventId,
      isPublic: data.isPublic,
      type: data.type
    }
  }
}

export const applicationConverter: FirestoreDataConverter<SockbaseApplicationDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot) => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      hashId: data.hashId,
      userId: data.userId,
      eventId: data.eventId,
      spaceId: data.spaceId,
      circle: data.circle,
      overview: data.overview,
      unionCircleId: data.unionCircleId,
      petitCode: data.petitCode,
      paymentMethod: data.paymentMethod,
      remarks: data.remarks,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }
  }
}

export const applicationHashIdConverter: FirestoreDataConverter<SockbaseApplicationHashIdDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot) => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      hashId: data.hashId,
      userId: data.userId,
      applicationId: data.applicationId,
      paymentId: data.paymentId,
      spaceId: data.spaceId,
      eventId: data.eventId,
      organizationId: data.organizationId
    }
  }
}

export const applicationLinksConverter: FirestoreDataConverter<SockbaseApplicationLinksDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot) => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      applicationId: data.applicationId,
      userId: data.userId,
      twitterScreenName: data.twitterScreenName,
      pixivUserId: data.pixivUserId,
      websiteURL: data.websiteURL,
      menuURL: data.menuURL
    }
  }
}

export const applicationMetaConverter: FirestoreDataConverter<SockbaseApplicationMeta> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot) => {
    const data = snapshot.data()
    return {
      applicationStatus: data.applicationStatus
    }
  }
}

export const eventConverter: FirestoreDataConverter<SockbaseEventDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot) => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      name: data.name,
      websiteURL: data.websiteURL,
      venue: data.venue,
      descriptions: data.descriptions,
      rules: data.rules,
      spaces: data.spaces,
      genres: data.genres,
      passConfig: data.passConfig,
      schedules: data.schedules,
      permissions: data.permissions,
      isPublic: data.isPublic,
      _organization: data._organization
    }
  }
}

export const spaceConverter: FirestoreDataConverter<SockbaseSpaceDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot) => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      eventId: data.eventId,
      spaceGroupOrder: data.spaceGroupOrder,
      spaceOrder: data.spaceOrder,
      spaceName: data.spaceName
    }
  }
}
