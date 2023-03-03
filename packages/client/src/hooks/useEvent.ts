import { MD5, enc } from 'crypto-js'
import dayjs from 'dayjs'

import { type FirebaseError } from 'firebase/app'
import { type User } from 'firebase/auth'
import * as FirestoreDB from 'firebase/firestore'

import useFirebase from './useFirebase'

import type {
  SockbaseApplication,
  SockbaseApplicationDocument,
  SockbaseEvent
} from 'sockbase'

interface IUseEvent {
  getEventByIdAsync: (eventId: string) => Promise<SockbaseEvent>
  submitApplicationAsync: (user: User, eventId: string, app: SockbaseApplication) => Promise<string>
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
    hashId: app.hashId,
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
    timestamp: FirestoreDB.serverTimestamp()
  }),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot, options: FirestoreDB.SnapshotOptions): SockbaseApplicationDocument => {
    const app = snapshot.data()
    return {
      hashId: app.hashId,
      userId: app.userId,
      spaceId: app.spaceId,
      circle: app.circle,
      overview: app.overview,
      unionCircleId: app.unionCircleId,
      petitCode: app.petitCode,
      paymentMethod: app.paymentMethod,
      remarks: app.remarks,
      timestamp: app.timestamp * 1000
    }
  }
}

const useEvent: () => IUseEvent = () => {
  const { getFirestore } = useFirebase()

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

  const submitApplicationAsync: (user: User, eventId: string, app: SockbaseApplication) => Promise<string> =
    async (user, eventId, app) => {
      const db = getFirestore()
      const applicationCol = FirestoreDB
        .collection(db, 'events', eventId, 'applications')
        .withConverter(applicationConverter)
      const appDoc: SockbaseApplicationDocument = {
        ...app,
        userId: user.uid,
        timestamp: 0,
        hashId: null
      }
      const createdAppDocRef = await FirestoreDB.addDoc(applicationCol, appDoc)
        .catch(err => {
          throw err
        })

      // TODO Cloud Functionsに移植して、Cloud FunctionsからgeneratedHashIdを取ってこれるようにする
      const generatedHashId = await generateHashId(eventId, createdAppDocRef)

      // TODO generatedHashId使ってサークルカットアップロードする

      console.log(generatedHashId)
      return generatedHashId
    }

  // TODO Cloud Functionsに移植する
  const generateHashId: (eventId: string, ref: FirestoreDB.DocumentReference) => Promise<string> =
    async (eventId, ref) => {
      const salt = 'sockbase-yogurt-koharurikka516'
      const codeDigit = 8
      const refHashId = MD5(`${eventId}.${ref.id}.${salt}`)
        .toString(enc.Hex)
        .slice(0, codeDigit)
      const formatedDateTime = dayjs().format('YYYYMMDDHmmSSS')
      const hashId = `${formatedDateTime}-${refHashId}`

      await FirestoreDB.updateDoc(ref, { hashId })
        .catch((err: FirebaseError) => {
          throw err
        })

      return hashId
    }

  return {
    getEventByIdAsync,
    submitApplicationAsync
  }
}

export default useEvent
