import * as FirestoreDB from 'firebase/firestore'

import useFirebase from './useFirebase'

import type {
  SockbaseEvent
} from 'sockbase'

const eventConverter: FirestoreDB.FirestoreDataConverter<SockbaseEvent> = {
  toFirestore: (event: SockbaseEvent): FirestoreDB.DocumentData => ({
    eventName: event.eventName,
    rules: event.rules,
    spaces: event.spaces.map(i => ({
      id: i.id,
      name: i.name,
      description: i.description,
      price: i.price
    })),
    schedules: {
      startApplication: event.schedules.startApplication,
      endApplication: event.schedules.endApplication,
      publishSpaces: event.schedules.publishSpaces,
      startEvent: event.schedules.startEvent,
      endEvent: event.schedules.endEvent
    },
    _organization: {
      id: event._organization.id,
      contactUrl: event._organization.contactUrl,
      name: event._organization.name
    }
  }),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot, options: FirestoreDB.SnapshotOptions): SockbaseEvent => {
    const event = snapshot.data()
    return {
      eventName: event.eventName,
      descriptions: event.descriptions,
      rules: event.rules,
      spaces: event.spaces,
      schedules: event.schedules,
      _organization: event._organization
    }
  }
}

interface IUseEvent {
  getEventByIdAsync: (eventId: string) => Promise<SockbaseEvent>
}
const useEvent: () => IUseEvent = () => {
  const { getFirestore } = useFirebase()

  const getEventByIdAsync: (eventId: string) => Promise<SockbaseEvent> =
    async (eventId) => {
      const db = getFirestore()
      const eventRef = FirestoreDB
        .doc(db, 'events', eventId)
        .withConverter(eventConverter)

      const eventDoc = await FirestoreDB.getDoc(eventRef)
      if (eventDoc.exists()) {
        return eventDoc.data()
      } else {
        throw new Error('event not found')
      }
    }

  return {
    getEventByIdAsync
  }
}

export default useEvent
