import type { DocumentData, FirestoreDataConverter, QueryDocumentSnapshot } from 'firebase/firestore'
import type { SockbaseEventDocument } from 'sockbase'

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
