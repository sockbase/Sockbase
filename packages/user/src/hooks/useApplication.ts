import { useCallback } from 'react'
import * as FirestoreDB from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import * as FirebaseStorage from 'firebase/storage'
import {
  applicationConverter,
  applicationHashIdConverter,
  applicationLinksConverter,
  applicationMetaConverter,
  overviewConverter
} from '../libs/converters'
import useFirebase from './useFirebase'
import type {
  SockbaseApplicationHashIdDocument,
  SockbaseApplicationDocument,
  SockbaseApplicationMeta,
  SockbaseApplicationPayload,
  SockbaseApplicationCreateResult,
  SockbaseApplicationLinksDocument,
  SockbaseApplicationLinks,
  SockbaseApplicationOverviewDocument,
  SockbaseApplicationOverview
} from 'sockbase'

interface IUseApplication {
  getApplicationIdByHashIdAsync: (hashId: string) => Promise<SockbaseApplicationHashIdDocument>
  getApplicationByIdAsync: (appId: string) => Promise<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>
  getApplicationByIdOptionalAsync: (appId: string) => Promise<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta } | null>
  getApplicationsByUserIdAsync: (userId: string) => Promise<SockbaseApplicationDocument[]>
  getApplicationsByUserIdWithIdAsync: (userId: string) => Promise<Record<string, SockbaseApplicationDocument>>
  getApplicationsByEventIdAsync: (eventId: string) => Promise<Record<string, SockbaseApplicationDocument>>
  submitApplicationAsync: (payload: SockbaseApplicationPayload) => Promise<SockbaseApplicationCreateResult>
  uploadCircleCutFileAsync: (appHashId: string, circleCutFile: File) => Promise<void>
  getApplicationMetaByIdAsync: (appId: string) => Promise<SockbaseApplicationMeta>
  getCircleCutURLByHashIdAsync: (hashId: string) => Promise<string>
  getCircleCutURLByHashIdNullableAsync: (hashId: string) => Promise<string | null>
  getLinksByApplicationIdAsync: (appId: string) => Promise<SockbaseApplicationLinksDocument | null>
  getLinksByApplicationIdOptionalAsync: (appId: string) => Promise<SockbaseApplicationLinksDocument | null>
  setLinksByApplicationIdAsync: (appId: string, links: SockbaseApplicationLinks) => Promise<void>
  getOverviewByApplicationIdAsync: (appId: string) => Promise<SockbaseApplicationOverviewDocument | null>
  getOverviewByApplicationIdOptionalAsync: (appId: string) => Promise<SockbaseApplicationOverviewDocument | null>
  setOverviewByApplicationIdAsync: (appId: string, overview: SockbaseApplicationOverview) => Promise<void>
}

const useApplication = (): IUseApplication => {
  const { user, getFirestore, getStorage, getFunctions } = useFirebase()

  const getApplicationIdByHashIdAsync = async (
    hashId: string
  ): Promise<SockbaseApplicationHashIdDocument> => {
    const db = getFirestore()
    const hashIdMVRef = FirestoreDB.doc(db, '_applicationHashIds', hashId)
      .withConverter(applicationHashIdConverter)

    const hashIdMVDoc = await FirestoreDB.getDoc(hashIdMVRef)
    if (!hashIdMVDoc.exists()) {
      throw new Error('hashId not found')
    }
    return hashIdMVDoc.data()
  }

  const getApplicationByIdAsync =
    async (appId: string): Promise<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }> => {
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
    }

  const getApplicationByIdOptionalAsync =
    async (appId: string): Promise<(SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }) | null> =>
      await getApplicationByIdAsync(appId)
        .catch(err => {
          console.error(err)
          return null
        })

  const getApplicationsByUserIdAsync =
    async (userId: string): Promise<SockbaseApplicationDocument[]> => {
      const db = getFirestore()
      const appsRef = FirestoreDB.collection(db, '_applications')
        .withConverter(applicationConverter)

      const appsQuery = FirestoreDB.query(
        appsRef,
        FirestoreDB.where('userId', '==', userId))
      const querySnapshot = await FirestoreDB.getDocs(appsQuery)
      const queryDocs = querySnapshot.docs
        .filter(doc => doc.exists())
        .map(doc => doc.data())

      return queryDocs
    }

  const getApplicationsByUserIdWithIdAsync =
    async (userId: string): Promise<Record<string, SockbaseApplicationDocument>> => {
      const db = getFirestore()
      const appsRef = FirestoreDB.collection(db, '_applications')
        .withConverter(applicationConverter)

      const appsQuery = FirestoreDB.query(
        appsRef,
        FirestoreDB.where('userId', '==', userId))
      const querySnapshot = await FirestoreDB.getDocs(appsQuery)
      const queryDocs = querySnapshot.docs
        .filter(doc => doc.exists())
        .reduce<Record<string, SockbaseApplicationDocument>>(
        (p, c) => ({ ...p, [c.id]: c.data() }),
        {}
      )

      return queryDocs
    }

  const getApplicationsByEventIdAsync =
    async (eventId: string): Promise<Record<string, SockbaseApplicationDocument>> => {
      const db = getFirestore()
      const appHashesRef = FirestoreDB.collection(db, '_applicationHashIds').withConverter(
        applicationHashIdConverter
      )

      const appHashesQuery = FirestoreDB.query(
        appHashesRef,
        FirestoreDB.where('eventId', '==', eventId)
      )
      const appHashesQuerySnapshot = await FirestoreDB.getDocs(appHashesQuery)
      const apps = await Promise.all(appHashesQuerySnapshot.docs
        .filter(doc => doc.exists())
        .map(doc => doc.data())
        .map(async appHash => ({
          id: appHash.applicationId,
          data: await getApplicationByIdAsync(appHash.applicationId)
        })))
        .then(fetchedApps => fetchedApps.reduce<Record<string, SockbaseApplicationDocument>>((p, c) => ({
          ...p,
          [c.id]: c.data
        }), {}))
        .catch(err => { throw err })
      return apps
    }

  const getApplicationMetaByIdAsync =
    async (appId: string): Promise<SockbaseApplicationMeta> => {
      const db = getFirestore()
      const metaRef = FirestoreDB.doc(db, '_applications', appId, 'private', 'meta')
        .withConverter(applicationMetaConverter)
      const metaDoc = await FirestoreDB.getDoc(metaRef)
      if (!metaDoc.exists()) {
        throw new Error('meta not found')
      }

      return metaDoc.data()
    }

  const submitApplicationAsync =
    async (payload: SockbaseApplicationPayload): Promise<SockbaseApplicationCreateResult> => {
      const functions = getFunctions()
      const createApplicationFunction = httpsCallable<
        SockbaseApplicationPayload,
        SockbaseApplicationCreateResult
      >(functions, 'application-createApplication')

      const appResult = await createApplicationFunction(payload)
      return appResult.data
    }

  const uploadCircleCutFileAsync =
    async (appHashId: string, circleCutFile: File): Promise<void> => {
      const storage = getStorage()
      const circleCutRef = FirebaseStorage.ref(storage, `circleCuts/${appHashId}`)
      await FirebaseStorage.uploadBytes(circleCutRef, circleCutFile)
    }

  const getCircleCutURLByHashIdAsync =
    async (hashId: string): Promise<string> => {
      const storage = getStorage()
      const circleCutRef = FirebaseStorage.ref(
        storage,
        `/circleCuts/${hashId}`
      )
      const circleCutURL = await FirebaseStorage.getDownloadURL(circleCutRef)
      return circleCutURL
    }

  const getCircleCutURLByHashIdNullableAsync =
  async (hashId: string): Promise<string | null> =>
    await getCircleCutURLByHashIdAsync(hashId)
      .catch(err => {
        console.error(err)
        return null
      })

  const getLinksByApplicationIdAsync =
    async (appId: string): Promise<SockbaseApplicationLinksDocument | null> => {
      const db = getFirestore()
      const linksDoc = FirestoreDB.doc(
        db,
        '_applicationLinks',
        appId)
        .withConverter(applicationLinksConverter)

      const links = await FirestoreDB.getDoc(linksDoc)
      if (!links.exists()) {
        return null
      }

      return links.data()
    }

  const getLinksByApplicationIdOptionalAsync =
    async (appId: string): Promise<SockbaseApplicationLinksDocument | null> =>
      await getLinksByApplicationIdAsync(appId).catch(() => null)

  const setLinksByApplicationIdAsync =
    useCallback(async (appId: string, links: SockbaseApplicationLinks): Promise<void> => {
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

      await FirestoreDB.setDoc(linksRef, linksDoc).catch(err => {
        throw err
      })
    }, [user])

  const getOverviewByApplicationIdAsync =
    async (appId: string): Promise<SockbaseApplicationOverviewDocument | null> => {
      const db = getFirestore()
      const overviewDoc = FirestoreDB.doc(db, '_applicationOverviews', appId)
        .withConverter(overviewConverter)

      const overview = await FirestoreDB.getDoc(overviewDoc)
      if (!overview.exists()) {
        return null
      }

      return overview.data()
    }

  const getOverviewByApplicationIdOptionalAsync =
    async (appId: string): Promise<SockbaseApplicationOverviewDocument | null> =>
      await getOverviewByApplicationIdAsync(appId)
        .then(fetchedOverview => fetchedOverview)
        .catch(err => {
          console.error(err)
          return null
        })

  const setOverviewByApplicationIdAsync =
    useCallback(async (appId: string, overview: SockbaseApplicationOverview) => {
      if (!user) return

      const db = getFirestore()
      const overviewRef = FirestoreDB.doc(db, '_applicationOverviews', appId)
        .withConverter(overviewConverter)

      const overviewDoc: SockbaseApplicationOverviewDocument = {
        ...overview,
        id: '',
        applicationId: appId,
        userId: user.uid
      }

      await FirestoreDB.setDoc(overviewRef, overviewDoc)
        .catch(err => {
          throw err
        })
    }, [user])

  return {
    getApplicationIdByHashIdAsync,
    getApplicationByIdAsync,
    getApplicationByIdOptionalAsync,
    getApplicationsByUserIdAsync,
    getApplicationsByUserIdWithIdAsync,
    getApplicationsByEventIdAsync,
    submitApplicationAsync,
    uploadCircleCutFileAsync,
    getApplicationMetaByIdAsync,
    getCircleCutURLByHashIdAsync,
    getCircleCutURLByHashIdNullableAsync,
    getLinksByApplicationIdAsync,
    getLinksByApplicationIdOptionalAsync,
    setLinksByApplicationIdAsync,
    getOverviewByApplicationIdAsync,
    getOverviewByApplicationIdOptionalAsync,
    setOverviewByApplicationIdAsync
  }
}

export default useApplication
