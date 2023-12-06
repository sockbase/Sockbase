import { useCallback } from 'react'
import type * as sockbase from 'sockbase'
import * as FirestoreDB from 'firebase/firestore'
import * as FirebaseStorage from 'firebase/storage'
import * as FirebaseFunctions from 'firebase/functions'
import useFirebase from './useFirebase'
import {
  applicationConverter,
  applicationHashIdConverter,
  applicationLinksConverter,
  applicationMetaConverter
} from '../libs/converters'

interface IUseApplication {
  getApplicationIdByHashedIdAsync: (hashedAppId: string) => Promise<sockbase.SockbaseApplicationHashIdDocument>
  getApplicationByIdAsync: (appId: string) => Promise<sockbase.SockbaseApplicationDocument & { meta: sockbase.SockbaseApplicationMeta }>
  getApplicationsByUserIdAsync: (userId: string) => Promise<sockbase.SockbaseApplicationDocument[]>
  getApplicationsByUserIdWithIdAsync: (userId: string) => Promise<Record<string, sockbase.SockbaseApplicationDocument>>
  getApplicationsByEventIdAsync: (eventId: string) => Promise<Record<string, sockbase.SockbaseApplicationDocument>>
  submitApplicationAsync: (app: sockbase.SockbaseApplication, circleCutFile: File) => Promise<sockbase.SockbaseApplicationAddedResult>
  getApplicationMetaByIdAsync: (appId: string) => Promise<sockbase.SockbaseApplicationMeta>
  updateApplicationStatusByIdAsync: (appId: string, status: sockbase.SockbaseApplicationStatus) => Promise<void>
  getCircleCutURLByHashedIdAsync: (hashedAppId: string) => Promise<string>
  getLinksByApplicationIdAsync: (appId: string) => Promise<sockbase.SockbaseApplicationLinksDocument | null>
  getLinksByApplicationIdOptionalAsync: (appId: string) => Promise<sockbase.SockbaseApplicationLinksDocument | null>
  setLinksByApplicationIdAsync: (appId: string, links: sockbase.SockbaseApplicationLinks) => Promise<void>
  exportCSV: (apps: sockbase.SockbaseApplicationDocument[]) => string
}
const useApplication: () => IUseApplication = () => {
  const { user, getFirestore, getStorage, getFunctions } = useFirebase()

  const getApplicationIdByHashedIdAsync: (hashedAppId: string) => Promise<sockbase.SockbaseApplicationHashIdDocument> =
    async (hashedAppId) => {
      const db = getFirestore()
      const hashIdMVRef = FirestoreDB.doc(db, '_applicationHashIds', hashedAppId)
        .withConverter(applicationHashIdConverter)

      const hashIdMVDoc = await FirestoreDB.getDoc(hashIdMVRef)
      if (!hashIdMVDoc.exists()) {
        throw new Error('hashId not found')
      }
      return hashIdMVDoc.data()
    }

  const getApplicationByIdAsync: (appId: string) => Promise<sockbase.SockbaseApplicationDocument & { meta: sockbase.SockbaseApplicationMeta }> =
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

  const getApplicationsByUserIdAsync: (userId: string) => Promise<sockbase.SockbaseApplicationDocument[]> =
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

  const getApplicationsByUserIdWithIdAsync: (userId: string) => Promise<Record<string, sockbase.SockbaseApplicationDocument>> =
    async (userId) => {
      const db = getFirestore()
      const appsRef = FirestoreDB.collection(db, '_applications')
        .withConverter(applicationConverter)

      const appsQuery = FirestoreDB.query(appsRef, FirestoreDB.where('userId', '==', userId))
      const querySnapshot = await FirestoreDB.getDocs(appsQuery)
      const queryDocs = querySnapshot.docs
        .filter(doc => doc.exists())
        .reduce<Record<string, sockbase.SockbaseApplicationDocument>>((p, c) => ({ ...p, [c.id]: c.data() }), {})

      return queryDocs
    }

  const getApplicationsByEventIdAsync: (eventId: string) => Promise<Record<string, sockbase.SockbaseApplicationDocument>> =
    async (eventId) => {
      const db = getFirestore()
      const appsRef = FirestoreDB.collection(db, '_applications')
        .withConverter(applicationConverter)

      const appsQuery = FirestoreDB.query(appsRef, FirestoreDB.where('eventId', '==', eventId))
      const querySnapshot = await FirestoreDB.getDocs(appsQuery)
      const queryDocs = querySnapshot.docs
        .filter(doc => doc.exists())
        .reduce<Record<string, sockbase.SockbaseApplicationDocument>>((p, c) => ({ ...p, [c.id]: c.data() }), {})

      return queryDocs
    }

  const getApplicationMetaByIdAsync: (appId: string) => Promise<sockbase.SockbaseApplicationMeta> =
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

  const submitApplicationAsync: (app: sockbase.SockbaseApplication, circleCutFile: File) => Promise<sockbase.SockbaseApplicationAddedResult> =
    async (app, circleCutFile) => {
      const functions = getFunctions()
      const createApplicationFunction = FirebaseFunctions
        .httpsCallable<sockbase.SockbaseApplication, sockbase.SockbaseApplicationAddedResult>(functions, 'application-createApplication')

      const appResult = await createApplicationFunction(app)
      const hashId = appResult.data.hashId

      const storage = getStorage()
      const circleCutRef = FirebaseStorage.ref(storage, `circleCuts/${hashId}`)
      await FirebaseStorage.uploadBytes(circleCutRef, circleCutFile)

      return appResult.data
    }

  const updateApplicationStatusByIdAsync: (appId: string, status: sockbase.SockbaseApplicationStatus) => Promise<void> =
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

  const getLinksByApplicationIdAsync = async (appId: string): Promise<sockbase.SockbaseApplicationLinksDocument | null> => {
    const db = getFirestore()
    const linksDoc = FirestoreDB.doc(db, '_applicationLinks', appId)
      .withConverter(applicationLinksConverter)

    const links = await FirestoreDB.getDoc(linksDoc)
    if (!links.exists()) {
      return null
    }

    return links.data()
  }

  const getLinksByApplicationIdOptionalAsync = async (appId: string): Promise<sockbase.SockbaseApplicationLinksDocument | null> => {
    return await getLinksByApplicationIdAsync(appId)
      .catch(() => null)
  }

  const setLinksByApplicationIdAsync = useCallback(async (appId: string, links: sockbase.SockbaseApplicationLinks): Promise<void> => {
    if (!user) return

    const db = getFirestore()
    const linksRef = FirestoreDB.doc(db, '_applicationLinks', appId)
      .withConverter(applicationLinksConverter)

    const linksDoc: sockbase.SockbaseApplicationLinksDocument = {
      ...links,
      id: '',
      applicationId: appId,
      userId: user.uid
    }

    await FirestoreDB.setDoc(linksRef, linksDoc)
      .catch(err => { throw err })
  }, [user])

  const exportCSV = (apps: sockbase.SockbaseApplicationDocument[]): string => {
    const header = 'id,name,penName,yomi,genre,space,unionId,description,totalAmount,remarks'
    const entries = apps
      .map(a => ([
        a.hashId,
        a.circle.name,
        a.circle.yomi,
        a.circle.penName,
        a.circle.genre,
        a.spaceId,
        a.unionCircleId || 'null',
        a.overview.description
          .replaceAll(',', '，')
          .replaceAll(/[\r\n]+/g, ' '),
        a.overview.totalAmount
          .replaceAll(',', '，')
          .replaceAll(/[\r\n]+/g, ' '),
        a.remarks
          .replaceAll(',', '，')
          .replaceAll(/[\r\n]+/g, ' ')
      ]))
      .map(a => a.join(','))
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
    getLinksByApplicationIdAsync,
    getLinksByApplicationIdOptionalAsync,
    setLinksByApplicationIdAsync,
    exportCSV
  }
}

export default useApplication
