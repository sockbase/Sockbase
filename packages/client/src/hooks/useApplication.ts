import * as FirestoreDB from 'firebase/firestore'
import * as FirebaseStorage from 'firebase/storage'
import * as FirebaseFunctions from 'firebase/functions'

import useFirebase from './useFirebase'

import type {
  SockbaseApplication,
  SockbaseApplicationAddedResult,
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
  submitApplicationAsync: (app: SockbaseApplication, circleCutFile: File) => Promise<SockbaseApplicationAddedResult>
  getApplicationMetaByIdAsync: (appId: string) => Promise<SockbaseApplicationMeta>
  updateApplicationStatusByIdAsync: (appId: string, status: SockbaseApplicationStatus) => Promise<void>
  getCircleCutURLByHashedIdAsync: (hashedAppId: string) => Promise<string>
}
const useApplication: () => IUseApplication = () => {
  const { getFirestore, getStorage, getFunctions } = useFirebase()

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

      const appRef = FirestoreDB.doc(db, '_applications', appId)
        .withConverter(applicationConverter)
      const appDoc = await FirestoreDB.getDoc(appRef)
      if (!appDoc.exists()) {
        throw new Error('application not found')
      }
      const app = appDoc.data()

      const metaRef = FirestoreDB.doc(db, '_applications', appId, 'private', 'meta')
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
      const appsRef = FirestoreDB.collection(db, '_applications')
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
      const appsRef = FirestoreDB.collection(db, '_applications')
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
      const appsRef = FirestoreDB.collection(db, '_applications')
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
      const metaRef = FirestoreDB.doc(db, '_applications', appId, 'private', 'meta')
        .withConverter(applicationMetaConverter)
      const metaDoc = await FirestoreDB.getDoc(metaRef)
      if (!metaDoc.exists()) {
        throw new Error('meta not found')
      }

      return metaDoc.data()
    }

  const submitApplicationAsync: (app: SockbaseApplication, circleCutFile: File) => Promise<SockbaseApplicationAddedResult> =
    async (app, circleCutFile) => {
      const functions = getFunctions()
      const createApplicationFunction = FirebaseFunctions
        .httpsCallable<SockbaseApplication, SockbaseApplicationAddedResult>(functions, 'ApplicationService-createApplication')

      const appResult = await createApplicationFunction(app)
      const hashId = appResult.data.hashId

      const storage = getStorage()
      const circleCutRef = FirebaseStorage.ref(storage, `circleCuts/${hashId}`)
      await FirebaseStorage.uploadBytes(circleCutRef, circleCutFile)

      return appResult.data
    }

  const updateApplicationStatusByIdAsync: (appId: string, status: SockbaseApplicationStatus) => Promise<void> =
    async (appId, status) => {
      const db = getFirestore()
      const metaRef = FirestoreDB.doc(db, '_applications', appId, 'private', 'meta')
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
