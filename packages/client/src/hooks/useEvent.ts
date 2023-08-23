import * as FirestoreDB from 'firebase/firestore'
import * as FirebaseStorage from 'firebase/storage'

import useFirebase from './useFirebase'

import type { SockbaseEvent, SockbaseSpaceDocument } from 'sockbase'

const eventConverter: FirestoreDB.FirestoreDataConverter<SockbaseEvent> = {
  toFirestore: (event: SockbaseEvent): FirestoreDB.DocumentData => ({
    // eventName: event.eventName,
    // rules: event.rules,
    // spaces: event.spaces.map(i => ({
    //   id: i.id,
    //   name: i.name,
    //   description: i.description,
    //   price: i.price
    // })),
    // schedules: {
    //   startApplication: event.schedules.startApplication,
    //   endApplication: event.schedules.endApplication,
    //   publishSpaces: event.schedules.publishSpaces,
    //   startEvent: event.schedules.startEvent,
    //   endEvent: event.schedules.endEvent
    // },
    // _organization: {
    //   id: event._organization.id,
    //   contactUrl: event._organization.contactUrl,
    //   name: event._organization.name
    // }
  }),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot, options: FirestoreDB.SnapshotOptions): SockbaseEvent => {
    const event = snapshot.data() as SockbaseEvent
    return {
      eventName: event.eventName,
      descriptions: event.descriptions,
      rules: event.rules,
      spaces: event.spaces
        .sort((a, b) => a.price - b.price),
      genres: event.genres,
      schedules: event.schedules,
      _organization: event._organization,
      permissions: event.permissions
    }
  }
}

const spaceConverter: FirestoreDB.FirestoreDataConverter<SockbaseSpaceDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot): SockbaseSpaceDocument => {
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

interface IUseEvent {
  getEventByIdAsync: (eventId: string) => Promise<SockbaseEvent>
  getEventEyecatch: (eventId: string) => Promise<string | null>
  getSpaceAsync: (spaceId: string) => Promise<SockbaseSpaceDocument>
  getSpaceOptionalAsync: (spaceId: string) => Promise<SockbaseSpaceDocument | null>
}
const useEvent: () => IUseEvent = () => {
  const { getFirestore, getStorage } = useFirebase()

  const getEventByIdAsync: (eventId: string) => Promise<SockbaseEvent> =
    async (eventId) => {
      const db = getFirestore()
      const eventRef = FirestoreDB
        .doc(db, 'events', eventId)
        .withConverter(eventConverter)

      const eventDoc = await FirestoreDB.getDoc(eventRef)
      if (!eventDoc.exists()) {
        throw new Error('event not found')
      }

      return eventDoc.data()
    }

  const getEventEyecatch: (eventId: string) => Promise<string | null> =
    async (eventId) => {
      const storage = getStorage()
      const eyecatchRef = FirebaseStorage.ref(storage, `/events/${eventId}/eyecatch.jpg`)
      const eyecatchURL = await FirebaseStorage.getDownloadURL(eyecatchRef)
        .catch(() => null)
      return eyecatchURL
    }

  const getSpaceAsync = async (spaceId: string): Promise<SockbaseSpaceDocument> => {
    const db = getFirestore()
    const spaceRef = FirestoreDB
      .doc(db, `spaces/${spaceId}`)
      .withConverter(spaceConverter)
    const spaceDoc = await FirestoreDB.getDoc(spaceRef)
    const space = spaceDoc.data()
    if (!space) {
      throw new Error('space not found')
    }
    return space
  }

  const getSpaceOptionalAsync = async (spaceId: string): Promise<SockbaseSpaceDocument | null> => {
    console.log(spaceId)
    return await getSpaceAsync(spaceId)
      .catch(() => null)
  }

  return {
    getEventByIdAsync,
    getEventEyecatch,
    getSpaceAsync,
    getSpaceOptionalAsync
  }
}

export default useEvent
