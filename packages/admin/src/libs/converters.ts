import type { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore'
import type {
  SockbaseAccount,
  SockbaseApplicationDocument,
  SockbaseApplicationHashIdDocument,
  SockbaseApplicationLinksDocument,
  SockbaseApplicationMeta,
  SockbaseEventDocument,
  SockbaseInformationDocument,
  SockbaseInquiryDocument,
  SockbaseInquiryMetaDocument,
  SockbaseStoreDocument
} from 'sockbase'

export const accountConverter: FirestoreDataConverter<SockbaseAccount> = {
  toFirestore: (userData: SockbaseAccount): DocumentData => ({
    name: userData.name,
    email: userData.email,
    birthday: userData.birthday,
    postalCode: userData.postalCode,
    address: userData.address,
    telephone: userData.telephone,
    gender: userData.gender
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseAccount => {
    const data = snapshot.data()
    return {
      name: data.name,
      email: data.email,
      birthday: new Date(data.birthday).getTime(),
      postalCode: data.postalCode,
      address: data.address,
      telephone: data.telephone,
      gender: data.gender
    }
  }
}

export const eventConverter: FirestoreDataConverter<SockbaseEventDocument> = {
  toFirestore: (event: SockbaseEventDocument): DocumentData => ({
    name: event.name,
    websiteURL: event.websiteURL,
    venue: event.venue,
    descriptions: event.descriptions,
    rules: event.rules,
    spaces: event.spaces,
    genres: event.genres,
    schedules: event.schedules,
    passConfig: event.passConfig,
    _organization: event._organization,
    permissions: event.permissions,
    isPublic: event.isPublic
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseEventDocument => {
    const event = snapshot.data() as SockbaseEventDocument
    return {
      id: snapshot.id,
      name: event.name,
      websiteURL: event.websiteURL,
      venue: event.venue,
      descriptions: event.descriptions,
      rules: event.rules,
      spaces: event.spaces
        .sort((a, b) => a.price - b.price),
      genres: event.genres,
      schedules: event.schedules,
      passConfig: event.passConfig,
      _organization: event._organization,
      permissions: event.permissions,
      isPublic: event.isPublic
    }
  }
}

export const storeConverter: FirestoreDataConverter<SockbaseStoreDocument> = {
  toFirestore: (store: SockbaseStoreDocument): DocumentData => ({
    name: store.name,
    websiteURL: store.websiteURL,
    venue: store.venue,
    descriptions: store.descriptions,
    rules: store.rules,
    schedules: store.schedules,
    _organization: store._organization,
    permissions: store.permissions,
    types: store.types,
    isPublic: store.isPublic
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseStoreDocument => {
    const store = snapshot.data()
    return {
      id: snapshot.id,
      name: store.name,
      websiteURL: store.websiteURL,
      venue: store.venue,
      descriptions: store.descriptions,
      rules: store.rules,
      schedules: store.schedules,
      _organization: store._organization,
      permissions: {
        ...store.permissions
      },
      types: store.types,
      isPublic: store.isPublic
    }
  }
}

export const informationConverter: FirestoreDataConverter<SockbaseInformationDocument> = {
  toFirestore: (info: SockbaseInformationDocument) => ({
    title: info.title,
    body: info.body,
    updatedAt: info.updatedAt,
    isPublished: info.isPublished
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseInformationDocument => {
    const info = snapshot.data()
    return {
      id: snapshot.id,
      title: info.title,
      body: info.body,
      updatedAt: info.updatedAt,
      isPublished: info.isPublished
    }
  }
}

export const inquiryConverter: FirestoreDataConverter<SockbaseInquiryDocument> =
  {
    toFirestore: (inquiry: SockbaseInquiryDocument) => ({
      userId: inquiry.userId,
      inquiryType: inquiry.inquiryType,
      body: inquiry.body,
      createdAt: null,
      updatedAt: null
    }),
    fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseInquiryDocument => {
      const inquiry = snapshot.data()
      return {
        id: snapshot.id,
        userId: inquiry.userId,
        inquiryType: inquiry.inquiryType,
        body: inquiry.body,
        status: inquiry.status,
        createdAt: inquiry.createdAt
          ? new Date(inquiry.createdAt.seconds * 1000)
          : null,
        updatedAt: inquiry.updatedAt
          ? new Date(inquiry.updatedAt.seconds * 1000)
          : null
      }
    }
  }

export const inquiryMetaConverter: FirestoreDataConverter<SockbaseInquiryMetaDocument> =
  {
    toFirestore: (meta: SockbaseInquiryMetaDocument) => ({
      status: meta.status
    }),
    fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseInquiryMetaDocument => {
      const meta = snapshot.data()
      return {
        status: meta.status,
        createdAt: meta.createdAt
          ? new Date(meta.createdAt.seconds * 1000)
          : null,
        updatedAt: meta.updatedAt
          ? new Date(meta.updatedAt.seconds * 1000)
          : null
      }
    }
  }

export const applicationConverter: FirestoreDataConverter<SockbaseApplicationDocument> = {
  toFirestore: (app: SockbaseApplicationDocument): DocumentData => ({}),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseApplicationDocument => {
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
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseApplicationMeta => {
    const meta = snapshot.data()
    return {
      applicationStatus: meta.applicationStatus
    }
  }
}

export const applicationHashIdConverter: FirestoreDataConverter<SockbaseApplicationHashIdDocument> = {
  toFirestore: (app: SockbaseApplicationHashIdDocument): DocumentData => ({
    spaceId: app.spaceId
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot): SockbaseApplicationHashIdDocument => {
    const hashDoc = snapshot.data()
    return {
      id: snapshot.id,
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
