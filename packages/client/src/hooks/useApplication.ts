import { useCallback } from 'react'
import * as FirestoreDB from 'firebase/firestore'
import * as FirebaseFunctions from 'firebase/functions'
import * as FirebaseStorage from 'firebase/storage'
import {
  applicationConverter,
  applicationHashIdConverter,
  applicationLinksConverter,
  applicationMetaConverter,
  overviewConverter
} from '../libs/converters'
import useFirebase from './useFirebase'
import type * as sockbase from 'sockbase'

interface IUseApplication {
  getApplicationIdByHashedIdAsync: (hashedAppId: string) => Promise<sockbase.SockbaseApplicationHashIdDocument>
  getApplicationByIdAsync: (appId: string) => Promise<sockbase.SockbaseApplicationDocument & { meta: sockbase.SockbaseApplicationMeta }>
  getApplicationByIdOptionalAsync: (appId: string) => Promise<sockbase.SockbaseApplicationDocument & { meta: sockbase.SockbaseApplicationMeta } | null>
  getApplicationsByUserIdAsync: (userId: string) => Promise<sockbase.SockbaseApplicationDocument[]>
  getApplicationsByUserIdWithIdAsync: (userId: string) => Promise<Record<string, sockbase.SockbaseApplicationDocument>>
  getApplicationsByEventIdAsync: (eventId: string) => Promise<Record<string, sockbase.SockbaseApplicationDocument>>
  submitApplicationAsync: (payload: sockbase.SockbaseApplicationPayload) => Promise<sockbase.SockbaseApplicationAddedResult>
  deleteApplicationAsync: (appHashId: string) => Promise<void>
  uploadCircleCutFileAsync: (appHashId: string, circleCutFile: File) => Promise<void>
  getApplicationMetaByIdAsync: (appId: string) => Promise<sockbase.SockbaseApplicationMeta>
  updateApplicationStatusByIdAsync: (appId: string, status: sockbase.SockbaseApplicationStatus) => Promise<void>
  getCircleCutURLByHashedIdAsync: (hashedAppId: string) => Promise<string>
  getCircleCutURLByHashedIdNullableAsync: (hashedAppId: string) => Promise<string | null>
  getLinksByApplicationIdAsync: (appId: string) => Promise<sockbase.SockbaseApplicationLinksDocument | null>
  getLinksByApplicationIdOptionalAsync: (appId: string) => Promise<sockbase.SockbaseApplicationLinksDocument | null>
  setLinksByApplicationIdAsync: (appId: string, links: sockbase.SockbaseApplicationLinks) => Promise<void>
  getOverviewByApplicationIdAsync: (appId: string) => Promise<sockbase.SockbaseApplicationOverviewDocument | null>
  getOverviewByApplicationIdOptionalAsync: (appId: string) => Promise<sockbase.SockbaseApplicationOverviewDocument | null>
  setOverviewByApplicationIdAsync: (appId: string, overview: sockbase.SockbaseApplicationOverview) => Promise<void>
}

const useApplication = (): IUseApplication => {
  const { user, getFirestore, getStorage, getFunctions } = useFirebase()

  const getApplicationIdByHashedIdAsync = async (
    hashedAppId: string
  ): Promise<sockbase.SockbaseApplicationHashIdDocument> => {
    const db = getFirestore()
    const hashIdMVRef = FirestoreDB.doc(db, '_applicationHashIds', hashedAppId)
      .withConverter(applicationHashIdConverter)

    const hashIdMVDoc = await FirestoreDB.getDoc(hashIdMVRef)
    if (!hashIdMVDoc.exists()) {
      throw new Error('hashId not found')
    }
    return hashIdMVDoc.data()
  }

  const getApplicationByIdAsync =
    async (appId: string): Promise<sockbase.SockbaseApplicationDocument & { meta: sockbase.SockbaseApplicationMeta }> => {
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
    async (appId: string): Promise<(sockbase.SockbaseApplicationDocument & { meta: sockbase.SockbaseApplicationMeta }) | null> =>
      await getApplicationByIdAsync(appId)
        .catch(err => {
          console.error(err)
          return null
        })

  const getApplicationsByUserIdAsync =
    async (userId: string): Promise<sockbase.SockbaseApplicationDocument[]> => {
      const db = getFirestore()
      const appsRef = FirestoreDB.collection(db, '_applications')
        .withConverter(applicationConverter)

      const appsQuery = FirestoreDB.query(
        appsRef,
        FirestoreDB.where('userId', '==', userId))
      const querySnapshot = await FirestoreDB.getDocs(appsQuery)
      const queryDocs = querySnapshot.docs
        .filter((doc) => doc.exists())
        .map((doc) => doc.data())

      return queryDocs
    }

  const getApplicationsByUserIdWithIdAsync =
    async (userId: string): Promise<Record<string, sockbase.SockbaseApplicationDocument>> => {
      const db = getFirestore()
      const appsRef = FirestoreDB.collection(db, '_applications')
        .withConverter(applicationConverter)

      const appsQuery = FirestoreDB.query(
        appsRef,
        FirestoreDB.where('userId', '==', userId))
      const querySnapshot = await FirestoreDB.getDocs(appsQuery)
      const queryDocs = querySnapshot.docs
        .filter((doc) => doc.exists())
        .reduce<Record<string, sockbase.SockbaseApplicationDocument>>(
        (p, c) => ({ ...p, [c.id]: c.data() }),
        {}
      )

      return queryDocs
    }

  const getApplicationsByEventIdAsync =
    async (eventId: string): Promise<Record<string, sockbase.SockbaseApplicationDocument>> => {
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
        .then(fetchedApps => fetchedApps.reduce<Record<string, sockbase.SockbaseApplicationDocument>>((p, c) => ({
          ...p,
          [c.id]: c.data
        }), {}))
        .catch(err => { throw err })
      return apps
    }

  const getApplicationMetaByIdAsync =
    async (appId: string): Promise<sockbase.SockbaseApplicationMeta> => {
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
    async (payload: sockbase.SockbaseApplicationPayload): Promise<sockbase.SockbaseApplicationAddedResult> => {
      const functions = getFunctions()
      const createApplicationFunction = FirebaseFunctions.httpsCallable<
        sockbase.SockbaseApplicationPayload,
        sockbase.SockbaseApplicationAddedResult
      >(functions, 'application-createApplication')

      const appResult = await createApplicationFunction(payload)
      return appResult.data
    }

  const deleteApplicationAsync =
    async (appHashId: string): Promise<void> => {
      const appHash = await getApplicationIdByHashedIdAsync(appHashId)
        .catch(err => { throw err })

      const db = getFirestore()
      const appOverviewRef = FirestoreDB.doc(db, `_applicationOverviews/${appHash.applicationId}`)
      const appLinksRef = FirestoreDB.doc(db, `_applicationLinks/${appHash.applicationId}`)
      const appMetaRef = FirestoreDB.doc(db, `_applications/${appHash.applicationId}/private/meta`)
      const appRef = FirestoreDB.doc(db, `_applications/${appHash.applicationId}`)
      const appHashRef = FirestoreDB.doc(db, `_applicationHashIds/${appHash.hashId}`)
      const paymentRef = (appHash.paymentId && FirestoreDB.doc(db, `_payments/${appHash.paymentId}`)) || null

      await FirestoreDB.runTransaction(db, async (transaction) => {
        transaction.delete(appOverviewRef)
        transaction.delete(appLinksRef)
        transaction.delete(appMetaRef)
        transaction.delete(appRef)
        transaction.delete(appHashRef)

        if (paymentRef) {
          transaction.delete(paymentRef)
        }
      })
        .catch(err => { throw err })

      const storage = getStorage()
      const circleCutRef = FirebaseStorage.ref(storage, `circleCuts/${appHash.hashId}`)
      await FirebaseStorage.deleteObject(circleCutRef)
        .catch((err: Error) => {
          if (err.message.includes('storage/object-not-found')) {
            console.error(err)
            return
          }
          throw err
        })
    }

  const uploadCircleCutFileAsync =
    async (appHashId: string, circleCutFile: File): Promise<void> => {
      const storage = getStorage()
      const circleCutRef = FirebaseStorage.ref(storage, `circleCuts/${appHashId}`)
      await FirebaseStorage.uploadBytes(circleCutRef, circleCutFile)
    }

  const updateApplicationStatusByIdAsync =
    async (appId: string, status: sockbase.SockbaseApplicationStatus): Promise<void> => {
      const db = getFirestore()
      const metaRef = FirestoreDB.doc(db, '_applications', appId, 'private', 'meta')
        .withConverter(applicationMetaConverter)

      FirestoreDB.setDoc(
        metaRef,
        {
          applicationStatus: status
        },
        { merge: true }
      ).catch((err) => {
        throw err
      })
    }

  const getCircleCutURLByHashedIdAsync =
    async (hashedAppId: string): Promise<string> => {
      const storage = getStorage()
      const circleCutRef = FirebaseStorage.ref(
        storage,
        `/circleCuts/${hashedAppId}`
      )
      const circleCutURL = await FirebaseStorage.getDownloadURL(circleCutRef)
      return circleCutURL
    }

  const getCircleCutURLByHashedIdNullableAsync =
  async (hashId: string): Promise<string | null> =>
    await getCircleCutURLByHashedIdAsync(hashId)
      .catch(err => {
        console.error(err)
        return null
      })

  const getLinksByApplicationIdAsync =
    async (appId: string): Promise<sockbase.SockbaseApplicationLinksDocument | null> => {
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
    async (appId: string): Promise<sockbase.SockbaseApplicationLinksDocument | null> =>
      await getLinksByApplicationIdAsync(appId).catch(() => null)

  const setLinksByApplicationIdAsync =
    useCallback(async (appId: string, links: sockbase.SockbaseApplicationLinks): Promise<void> => {
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

      await FirestoreDB.setDoc(linksRef, linksDoc).catch((err) => {
        throw err
      })
    }, [user])

  const getOverviewByApplicationIdAsync =
    async (appId: string): Promise<sockbase.SockbaseApplicationOverviewDocument | null> => {
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
    async (appId: string): Promise<sockbase.SockbaseApplicationOverviewDocument | null> =>
      await getOverviewByApplicationIdAsync(appId)
        .then((fetchedOverview) => fetchedOverview)
        .catch(err => {
          console.error(err)
          return null
        })

  const setOverviewByApplicationIdAsync =
    useCallback(async (appId: string, overview: sockbase.SockbaseApplicationOverview) => {
      if (!user) return

      const db = getFirestore()
      const overviewRef = FirestoreDB.doc(db, '_applicationOverviews', appId)
        .withConverter(overviewConverter)

      const overviewDoc: sockbase.SockbaseApplicationOverviewDocument = {
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
    getApplicationIdByHashedIdAsync,
    getApplicationByIdAsync,
    getApplicationByIdOptionalAsync,
    getApplicationsByUserIdAsync,
    getApplicationsByUserIdWithIdAsync,
    getApplicationsByEventIdAsync,
    submitApplicationAsync,
    deleteApplicationAsync,
    uploadCircleCutFileAsync,
    getApplicationMetaByIdAsync,
    updateApplicationStatusByIdAsync,
    getCircleCutURLByHashedIdAsync,
    getCircleCutURLByHashedIdNullableAsync,
    getLinksByApplicationIdAsync,
    getLinksByApplicationIdOptionalAsync,
    setLinksByApplicationIdAsync,
    getOverviewByApplicationIdAsync,
    getOverviewByApplicationIdOptionalAsync,
    setOverviewByApplicationIdAsync
  }
}

export default useApplication
