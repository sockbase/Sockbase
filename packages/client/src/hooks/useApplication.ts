import * as FirestoreDB from 'firebase/firestore'
import * as FirebaseStorage from 'firebase/storage'
import * as FirebaseFunctions from 'firebase/functions'

import useFirebase from './useFirebase'

import type {
  SockbaseApplication,
  SockbaseApplicationAddedResult,
  SockbaseApplicationDocument,
  SockbaseApplicationLinks,
  SockbaseApplicationLinksDocument,
  SockbaseApplicationMeta,
  SockbaseApplicationStatus
} from 'sockbase'
import { useCallback } from 'react'

interface ApplicationHashIdDocument {
  applicationId: string
  hashId: string
  paymentId: string
}
const applicationHashIdConverter: FirestoreDB.FirestoreDataConverter<ApplicationHashIdDocument> = {
  toFirestore: (app: ApplicationHashIdDocument): FirestoreDB.DocumentData => ({}),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot, options: FirestoreDB.SnapshotOptions): ApplicationHashIdDocument => {
    const hashDoc = snapshot.data()
    return {
      applicationId: hashDoc.applicationId,
      hashId: hashDoc.hashId,
      paymentId: hashDoc.paymentId
    }
  }
}

const applicationConverter: FirestoreDB.FirestoreDataConverter<SockbaseApplicationDocument> = {
  toFirestore: (app: SockbaseApplicationDocument): FirestoreDB.DocumentData => ({}),
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
      createdAt: app.createdAt ? new Date(app.createdAt.seconds * 1000) : null,
      updatedAt: app.updatedAt ? new Date(app.updatedAt.seconds * 1000) : null
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

const applicationLinksConverter: FirestoreDB.FirestoreDataConverter<SockbaseApplicationLinksDocument> = {
  toFirestore: (links: SockbaseApplicationLinksDocument) => ({
    userId: links.userId,
    applicationId: links.applicationId,
    twitterScreenName: links.twitterScreenName,
    pixivUserId: links.pixivUserId,
    websiteURL: links.websiteURL,
    menuURL: links.menuURL
  }),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot): SockbaseApplicationLinksDocument => {
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

interface IUseApplication {
  getApplicationIdByHashedIdAsync: (hashedAppId: string) => Promise<string>
  getApplicationByIdAsync: (appId: string) => Promise<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>
  getApplicationsByUserIdAsync: (userId: string) => Promise<SockbaseApplicationDocument[]>
  getApplicationsByUserIdWithIdAsync: (userId: string) => Promise<Record<string, SockbaseApplicationDocument>>
  getApplicationsByEventIdAsync: (eventId: string) => Promise<Record<string, SockbaseApplicationDocument>>
  submitApplicationAsync: (app: SockbaseApplication, circleCutFile: File) => Promise<SockbaseApplicationAddedResult>
  getApplicationMetaByIdAsync: (appId: string) => Promise<SockbaseApplicationMeta>
  updateApplicationStatusByIdAsync: (appId: string, status: SockbaseApplicationStatus) => Promise<void>
  getCircleCutURLByHashedIdAsync: (hashedAppId: string) => Promise<string>
  getLinksByApplicationIdAsync: (appId: string) => Promise<SockbaseApplicationLinksDocument | null>
  getLinksByApplicationIdOptionalAsync: (appId: string) => Promise<SockbaseApplicationLinksDocument | null>
  setLinksByApplicationIdAsync: (appId: string, links: SockbaseApplicationLinks) => Promise<void>
  exportCSV: (apps: SockbaseApplicationDocument[]) => string
}
const useApplication: () => IUseApplication = () => {
  const { user, getFirestore, getStorage, getFunctions } = useFirebase()

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

  const getApplicationsByEventIdAsync: (eventId: string) => Promise<Record<string, SockbaseApplicationDocument>> =
    async (eventId) => {
      const db = getFirestore()
      const appsRef = FirestoreDB.collection(db, '_applications')
        .withConverter(applicationConverter)

      const appsQuery = FirestoreDB.query(appsRef, FirestoreDB.where('eventId', '==', eventId))
      const querySnapshot = await FirestoreDB.getDocs(appsQuery)
      const queryDocs = querySnapshot.docs
        .filter(doc => doc.exists())
        .reduce<Record<string, SockbaseApplicationDocument>>((p, c) => ({ ...p, [c.id]: c.data() }), {})

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

  const getLinksByApplicationIdAsync = async (appId: string): Promise<SockbaseApplicationLinksDocument | null> => {
    const db = getFirestore()
    const linksDoc = FirestoreDB.doc(db, '_applicationLinks', appId)
      .withConverter(applicationLinksConverter)

    const links = await FirestoreDB.getDoc(linksDoc)
    if (!links.exists()) {
      return null
    }

    return links.data()
  }

  const getLinksByApplicationIdOptionalAsync = async (appId: string): Promise<SockbaseApplicationLinksDocument | null> => {
    return await getLinksByApplicationIdAsync(appId)
      .catch(() => null)
  }

  const setLinksByApplicationIdAsync = useCallback(async (appId: string, links: SockbaseApplicationLinks): Promise<void> => {
    if (!user) return

    const db = getFirestore()
    const linksRef = FirestoreDB.doc(db, '_applicationLinks', appId)
      .withConverter(applicationLinksConverter)

    const linksDoc: SockbaseApplicationLinksDocument = {
      ...links,
      id: '',
      applicationId: appId,
      userId: user.uid
    }

    await FirestoreDB.setDoc(linksRef, linksDoc)
      .catch(err => { throw err })
  }, [user])

  const exportCSV = (apps: SockbaseApplicationDocument[]): string => {
    const header = 'id,name,penName,yomi,genre,space,unionId,description,totalAmount'
    const entries = apps
      .map(a => ({
        hashId: a.hashId,
        circleName: a.circle.name,
        circleNameYomi: a.circle.yomi,
        penName: a.circle.penName,
        genre: a.circle.genre,
        spaceId: a.spaceId,
        unionCircle: a.unionCircleId || 'null',
        description: a.overview.description
          .replaceAll(',', '，')
          .replaceAll(/[\r\n]+/g, ' '),
        totalAmount: a.overview.totalAmount
          .replaceAll(',', '，')
          .replaceAll(/[\r\n]+/g, ' '),
        remarks: a.remarks
          .replaceAll(',', '，')
          .replaceAll(/[\r\n]+/g, ' ')
      }))
      .map(a => `${a.hashId},${a.circleName},${a.penName},${a.circleNameYomi},${a.genre},${a.spaceId},${a.unionCircle},${a.description},${a.totalAmount},${a.remarks}`)
      .join('\n')

    return `${header}\n${entries}\n`
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
    getCircleCutURLByHashedIdAsync,
    getLinksByApplicationIdOptionalAsync,
    getLinksByApplicationIdAsync,
    setLinksByApplicationIdAsync,
    exportCSV
  }
}

export default useApplication
