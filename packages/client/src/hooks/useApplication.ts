import { MD5, enc } from 'crypto-js'
import dayjs from 'dayjs'

import { type FirebaseError } from 'firebase/app'
import { type User } from 'firebase/auth'
import * as FirestoreDB from 'firebase/firestore'
import * as FirebaseStorage from 'firebase/storage'

import useFirebase from './useFirebase'

import type {
  SockbaseApplication,
  SockbaseApplicationDocument,
  SockbaseApplicationMeta,
  SockbaseApplicationStatus
} from 'sockbase'

interface ApplicationHashIdDocument {
  applicationId: string
  hashId: string
}
const applicationHashIdConverter: FirestoreDB.FirestoreDataConverter<ApplicationHashIdDocument> = {
  toFirestore: (app: ApplicationHashIdDocument): FirestoreDB.DocumentData => ({}),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot, options: FirestoreDB.SnapshotOptions): ApplicationHashIdDocument => {
    const hashDoc = snapshot.data()
    return {
      applicationId: hashDoc.applicationId,
      hashId: hashDoc.hashId
    }
  }
}

const applicationConverter: FirestoreDB.FirestoreDataConverter<SockbaseApplicationDocument> = {
  toFirestore: (app: SockbaseApplicationDocument): FirestoreDB.DocumentData => ({
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

const applicationMetaConverter: FirestoreDB.FirestoreDataConverter<SockbaseApplicationMeta> = {
  toFirestore: (meta: SockbaseApplicationMeta) => ({
    applicationStatus: meta.applicationStatus
  }),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot, options: FirestoreDB.SnapshotOptions): SockbaseApplicationMeta => {
    const meta = snapshot.data()
    return {
      applicationStatus: meta.applicationStatus
    }
  }
}

interface IUseApplication {
  getApplicationIdByHashedIdAsync: (hashedAppId: string) => Promise<string>
  getApplicationByIdAsync: (appId: string) => Promise<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>
  getApplicationsByUserIdAsync: (userId: string) => Promise<SockbaseApplicationDocument[]>
  getApplicationsByUserIdWithIdAsync: (userId: string) => Promise<Record<string, SockbaseApplicationDocument>>
  getApplicationsByEventIdAsync: (eventId: string) => Promise<SockbaseApplicationDocument[]>
  submitApplicationAsync: (user: User, app: SockbaseApplication, circleCutFile: File) => Promise<string>
  getApplicationMetaByIdAsync: (appId: string) => Promise<SockbaseApplicationMeta>
  updateApplicationStatusByIdAsync: (appId: string, status: SockbaseApplicationStatus) => Promise<void>
  getCircleCutURLByHashedIdAsync: (hashedAppId: string) => Promise<string>
}
const useApplication: () => IUseApplication = () => {
  const { getFirestore, getStorage } = useFirebase()

  const getApplicationIdByHashedIdAsync: (hashedAppId: string) => Promise<string> =
    async (hashedAppId) => {
      const db = getFirestore()
      const hashIdMVRef = FirestoreDB.doc(db, '_applicationHashIds', hashedAppId)
        .withConverter(applicationHashIdConverter)

      const hashIdMVDoc = await FirestoreDB.getDoc(hashIdMVRef)
      if (!hashIdMVDoc.exists()) {
        throw new Error('hashId not found')
      }
      return hashIdMVDoc.data().applicationId
    }

  const getApplicationByIdAsync: (appId: string) => Promise<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }> =
    async (appId) => {
      const db = getFirestore()

      const appRef = FirestoreDB.doc(db, 'applications', appId)
        .withConverter(applicationConverter)
      const appDoc = await FirestoreDB.getDoc(appRef)
      if (!appDoc.exists()) {
        throw new Error('application not found')
      }
      const app = appDoc.data()

      const metaRef = FirestoreDB.doc(db, 'applications', appId, 'private', 'meta')
        .withConverter(applicationMetaConverter)
      const metaDoc = await FirestoreDB.getDoc(metaRef)
      if (!metaDoc.exists()) {
        throw new Error('meta not found')
      }
      const meta = metaDoc.data()

      return { ...app, meta }
      //     return metaDoc.data()
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

  const getApplicationsByUserIdWithIdAsync: (userId: string) => Promise<Record<string, SockbaseApplicationDocument>> =
    async (userId) => {
      const db = getFirestore()
      const appsRef = FirestoreDB.collection(db, 'applications')
        .withConverter(applicationConverter)

      const appsQuery = FirestoreDB.query(appsRef, FirestoreDB.where('userId', '==', userId))
      const querySnapshot = await FirestoreDB.getDocs(appsQuery)
      const queryDocs = querySnapshot.docs
        .filter(doc => doc.exists())
        .reduce<Record<string, SockbaseApplicationDocument>>((p, c) => ({ ...p, [c.id]: c.data() }), {})

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

  const getApplicationMetaByIdAsync: (appId: string) => Promise<SockbaseApplicationMeta> =
    async (appId) => {
      const db = getFirestore()
      const metaRef = FirestoreDB.doc(db, 'applications', appId, 'private', 'meta')
        .withConverter(applicationMetaConverter)
      const metaDoc = await FirestoreDB.getDoc(metaRef)
      if (!metaDoc.exists()) {
        throw new Error('meta not found')
      }

      return metaDoc.data()
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

  const updateApplicationStatusByIdAsync: (appId: string, status: SockbaseApplicationStatus) => Promise<void> =
    async (appId, status) => {
      const db = getFirestore()
      const metaRef = FirestoreDB.doc(db, 'applications', appId, 'private', 'meta')
        .withConverter(applicationMetaConverter)

      FirestoreDB.setDoc(metaRef, {
        applicationStatus: status
      }, { merge: true })
        .catch(err => {
          throw err
        })
    }

  const getCircleCutURLByHashedIdAsync: (hashedAppId: string) => Promise<string> =
    async (hashedAppId) => {
      const storage = getStorage()
      const circleCutRef = FirebaseStorage.ref(storage, `/circleCuts/${hashedAppId}`)
      const circleCutURL = await FirebaseStorage.getDownloadURL(circleCutRef)
      return circleCutURL
    }

  // TODO Cloud Functionsに移植する
  const generateHashId: (eventId: string, ref: FirestoreDB.DocumentReference) => Promise<string> =
    async (eventId, ref) => {
      const salt = 'sockbase-yogurt-koharurikka516'
      const codeDigit = 8
      const refHashId = MD5(`${eventId}.${ref.id}.${salt}`)
        .toString(enc.Hex)
        .slice(0, codeDigit)
      const formatedDateTime = dayjs().format('YYYYMMDDHmmssSSS')
      const hashId = `${formatedDateTime}-${refHashId}`

      await FirestoreDB.updateDoc(ref, { hashId })
        .catch((err: FirebaseError) => {
          throw err
        })

      return hashId
    }

  return {
    getApplicationIdByHashedIdAsync,
    getApplicationByIdAsync,
    getApplicationsByUserIdAsync,
    getApplicationsByUserIdWithIdAsync,
    getApplicationsByEventIdAsync,
    submitApplicationAsync,
    getApplicationMetaByIdAsync,
    updateApplicationStatusByIdAsync,
    getCircleCutURLByHashedIdAsync
  }
}

export default useApplication
