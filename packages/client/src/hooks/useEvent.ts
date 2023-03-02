import useFirebase from './useFirebase'
import * as FirestoreDB from 'firebase/firestore'

import type {
  SockbaseApplication,
  SockbaseApplicationDocument,
  SockbaseEvent
} from 'sockbase'

interface IUseEvent {
  getEventByIdAsync: (eventId: string) => Promise<SockbaseEvent>
  submitApplicationAsync: (eventId: string, app: SockbaseApplication) => Promise<void>
}

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
    organization: {
      id: event.organization.id,
      contactUrl: event.organization.contactUrl,
      name: event.organization.name
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
      organization: event.organization
    }
  }
}

const applicationConverter: FirestoreDB.FirestoreDataConverter<SockbaseApplicationDocument> = {
  toFirestore: (app: SockbaseApplicationDocument): FirestoreDB.DocumentData => ({
    userId: app.userId,
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
    timestamp: app.timestamp
  }),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot, options: FirestoreDB.SnapshotOptions): SockbaseApplicationDocument => {
    const app = snapshot.data()
    return {
      userId: app.userId,
      spaceId: app.spaceId,
      circle: app.circle,
      overview: app.overview,
      unionCircleId: app.unionCircleId,
      petitCode: app.petitCode,
      paymentMethod: app.paymentMethod,
      remarks: app.remarks,
      timestamp: app.timestamp
    }
  }
}

const useEvent: () => IUseEvent = () => {
  const { getFirestore, user } = useFirebase()

  const getEventByIdAsync: (eventId: string) => Promise<SockbaseEvent> =
    async (eventId) => {
      const db = getFirestore()
      const eventDoc = FirestoreDB
        .doc(db, 'events', eventId)
        .withConverter(eventConverter)
      const snap = await FirestoreDB.getDoc(eventDoc)
      if (snap.exists()) {
        return snap.data()
      } else {
        throw new Error('eventId not found')
      }
    }

  const submitApplicationAsync: (eventId: string, app: SockbaseApplication) => Promise<void> =
    async (eventId, app) => {
      if (!user) {
        throw new Error('no login')
      }

      const db = getFirestore()
      const applicationCol = FirestoreDB
        .collection(db, 'events', eventId, 'applications')
        .withConverter(applicationConverter)
      const appDoc: SockbaseApplicationDocument = {
        ...app,
        userId: user.uid,
        timestamp: new Date().getTime()
      }
      const applicationRef = await FirestoreDB.addDoc(applicationCol, appDoc)
        .catch(err => {
          throw err
        })
      alert(applicationRef)
    }

  return {
    getEventByIdAsync,
    submitApplicationAsync
  }
}

export default useEvent
