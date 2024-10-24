import type { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore'
import type { SockbaseEventDocument, SockbaseInformationDocument, SockbaseStoreDocument } from 'sockbase'

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
