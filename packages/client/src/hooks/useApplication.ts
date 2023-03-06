import { MD5, enc } from 'crypto-js'
import dayjs from 'dayjs'

import { type FirebaseError } from 'firebase/app'
import { type User } from 'firebase/auth'
import * as FirestoreDB from 'firebase/firestore'
import * as FirebaseStorage from 'firebase/storage'

import useFirebase from './useFirebase'

import type {
  SockbaseApplication,
  SockbaseApplicationDocument
} from 'sockbase'

const applicationConverter: FirestoreDB.FirestoreDataConverter<SockbaseApplicationDocument> = {
  toFirestore: (app: SockbaseApplicationDocument): FirestoreDB.DocumentData => ({
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
    timestamp: FirestoreDB.serverTimestamp()
  }),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot, options: FirestoreDB.SnapshotOptions): SockbaseApplicationDocument => {
    const app = snapshot.data()
    return {
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
      timestamp: app.timestamp.toDate().getTime()
    }
  }
}

interface IUseApplication {
  getApplicationByHashedIdAsync: (userId: string, hashedAppId: string) => Promise<SockbaseApplicationDocument>
  getApplicationsByUserIdAsync: (userId: string) => Promise<SockbaseApplicationDocument[]>
  getApplicationsByEventIdAsync: (eventId: string) => Promise<SockbaseApplicationDocument[]>
  submitApplicationAsync: (user: User, app: SockbaseApplication, circleCutFile: File) => Promise<string>
}
const useApplication: () => IUseApplication = () => {
  const { getFirestore, getStorage } = useFirebase()

  const getApplicationByHashedIdAsync: (userId: string, hashedAppId: string) => Promise<SockbaseApplicationDocument> =
    async (userId, hashedAppId) => {
      const db = getFirestore()
      const appsRef = FirestoreDB.collection(db, 'applications')
        .withConverter(applicationConverter)

      const appsQuery = FirestoreDB.query(
        appsRef,
        FirestoreDB.where('userId', '==', userId),
        FirestoreDB.where('hashId', '==', hashedAppId))
      const querySnapshot = await FirestoreDB.getDocs(appsQuery)
      const queryDocs = querySnapshot.docs
      if (queryDocs.length !== 1) {
        throw new Error('application not found')
      }

      const appDoc = queryDocs[0]
      if (appDoc.exists()) {
        return appDoc.data()
      } else {
        throw new Error('application not found')
      }
    }

  const getApplicationsByUserIdAsync: (userId: string) => Promise<SockbaseApplicationDocument[]> =
    async (userId) => {
      const db = getFirestore()
      const appsRef = FirestoreDB.collection(db, 'applications')
        .withConverter(applicationConverter)

      const appsQuery = FirestoreDB.query(appsRef, FirestoreDB.where('userId', '==', userId))
      const querySnapshot = await FirestoreDB.getDocs(appsQuery)
      const queryDocs = querySnapshot.docs
        .filter(doc => doc.exists())
        .map(doc => doc.data())

      return queryDocs
    }

  const getApplicationsByEventIdAsync: (eventId: string) => Promise<SockbaseApplicationDocument[]> =
    async (eventId) => {
      const db = getFirestore()
      const appsRef = FirestoreDB.collection(db, 'applications')
        .withConverter(applicationConverter)

      const appsQuery = FirestoreDB.query(appsRef, FirestoreDB.where('eventId', '==', eventId))
      const querySnapshot = await FirestoreDB.getDocs(appsQuery)
      const queryDocs = querySnapshot.docs
        .filter(doc => doc.exists())
        .map(doc => doc.data())

      return queryDocs
    }

  const submitApplicationAsync: (user: User, app: SockbaseApplication, circleCutFile: File) => Promise<string> =
    async (user, app, circleCutFile) => {
      const db = getFirestore()
      const appCol = FirestoreDB.collection(db, 'applications')
        .withConverter(applicationConverter)
      const appDoc: SockbaseApplicationDocument = {
        ...app,
        userId: user.uid,
        timestamp: 0,
        hashId: null
      }
      const createdAppDocRef = await FirestoreDB.addDoc(appCol, appDoc)
        .catch(err => {
          throw err
        })

      // TODO Cloud Functionsに移植して、Cloud FunctionsからgeneratedHashIdを取ってこれるようにする
      const generatedHashId = await generateHashId(app.eventId, createdAppDocRef)

      const storage = getStorage()
      const circleCutRef = FirebaseStorage.ref(storage, `circleCuts/${generatedHashId}`)
      await FirebaseStorage.uploadBytes(circleCutRef, circleCutFile)

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
    getApplicationByHashedIdAsync,
    getApplicationsByUserIdAsync,
    getApplicationsByEventIdAsync,
    submitApplicationAsync
  }
}

export default useApplication
