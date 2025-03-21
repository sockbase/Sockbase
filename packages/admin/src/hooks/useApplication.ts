import { useCallback } from 'react'
import { collection, query, where, getDocs, doc, getDoc, setDoc, runTransaction } from 'firebase/firestore'
import { deleteObject, getDownloadURL, ref } from 'firebase/storage'
import {
  applicationConverter,
  applicationHashIdConverter,
  applicationLinksConverter,
  applicationMetaConverter
} from '../libs/converters'
import useFirebase from './useFirebase'
import usePayment from './usePayment'
import type {
  SockbaseApplicationDocument,
  SockbaseApplicationHashIdDocument,
  SockbaseApplicationLinksDocument,
  SockbaseApplicationMeta,
  SockbaseApplicationOverviewDocument,
  SockbaseApplicationStatus
} from 'sockbase'

interface IUseApplication {
  getApplicationIdByHashIdAsync: (appHashId: string) => Promise<SockbaseApplicationHashIdDocument>
  getApplicationByIdAsync: (appId: string) => Promise<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>
  getApplicationsByEventIdAsync: (eventId: string) => Promise<Array<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>>
  getLinksByApplicationIdAsync: (appId: string) => Promise<SockbaseApplicationLinksDocument | null>
  setApplicationStatusByIdAsync: (appId: string, status: SockbaseApplicationStatus) => Promise<void>
  deleteApplicationAsync: (appHashId: string) => Promise<void>
  getCircleCutURLByHashIdNullableAsync: (hashId: string) => Promise<string | null>
  getOverviewByIdNullableAsync: (appId: string) => Promise<SockbaseApplicationOverviewDocument | null>
}

const useApplication = (): IUseApplication => {
  const { getFirestore, getStorage } = useFirebase()
  const db = getFirestore()
  const storage = getStorage()
  const { getPaymentByIdAsync } = usePayment()

  const getApplicationIdByHashIdAsync =
    useCallback(async (appHashId: string) => {
      const hashIdMVRef = doc(db, '_applicationHashIds', appHashId)
        .withConverter(applicationHashIdConverter)

      const hashIdMVDoc = await getDoc(hashIdMVRef)
      if (!hashIdMVDoc.exists()) {
        throw new Error('hashId not found')
      }
      return hashIdMVDoc.data()
    }, [])

  const getApplicationByIdAsync =
    useCallback(async (appId: string) => {
      const appRef = doc(db, '_applications', appId)
        .withConverter(applicationConverter)

      const appDoc = await getDoc(appRef)
      if (!appDoc.exists()) {
        throw new Error('application not found')
      }
      const app = appDoc.data()

      const metaRef = doc(db, '_applications', appId, 'private', 'meta')
        .withConverter(applicationMetaConverter)

      const metaDoc = await getDoc(metaRef)
      if (!metaDoc.exists()) {
        throw new Error('meta not found')
      }
      const meta = metaDoc.data()
      return { ...app, meta }
    }, [])

  const getApplicationsByEventIdAsync =
    useCallback(async (eventId: string) => {
      const appHashesRef = collection(db, '_applicationHashIds')
        .withConverter(applicationHashIdConverter)

      const appHashesQuery = query(
        appHashesRef,
        where('eventId', '==', eventId)
      )
      const appHashesQuerySnapshot = await getDocs(appHashesQuery)
      const apps = await Promise.all(
        appHashesQuerySnapshot.docs
          .filter(doc => doc.exists())
          .map(doc => doc.data())
          .map(async appHash => ({
            id: appHash.applicationId,
            data: await getApplicationByIdAsync(appHash.applicationId)
          })))
        .then(fetchedApps =>
          fetchedApps.reduce<Array<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>>(
            (p, c) => ([...p, c.data]), []))
        .catch(err => { throw err })
      return apps
    }, [])

  const getLinksByApplicationIdAsync =
    useCallback(async (appId: string): Promise<SockbaseApplicationLinksDocument | null> => {
      const linksDoc = doc(db, '_applicationLinks', appId)
        .withConverter(applicationLinksConverter)

      const links = await getDoc(linksDoc)
      if (!links.exists()) {
        return null
      }

      return links.data()
    }, [])

  const setApplicationStatusByIdAsync =
    useCallback(async (appId: string, status: SockbaseApplicationStatus) => {
      const metaRef = doc(db, '_applications', appId, 'private', 'meta')
        .withConverter(applicationMetaConverter)

      setDoc(metaRef, { applicationStatus: status }, { merge: true })
        .catch(err => { throw err })
    }, [])

  const deleteApplicationAsync =
    useCallback(async (appHashId: string) => {
      const appHash = await getApplicationIdByHashIdAsync(appHashId)
        .catch(err => { throw err })

      const payment = await getPaymentByIdAsync(appHash.paymentId)

      const db = getFirestore()
      const appOverviewRef = doc(db, `_applicationOverviews/${appHash.applicationId}`)
      const appLinksRef = doc(db, `_applicationLinks/${appHash.applicationId}`)
      const appMetaRef = doc(db, `_applications/${appHash.applicationId}/private/meta`)
      const appRef = doc(db, `_applications/${appHash.applicationId}`)
      const appHashRef = doc(db, `_applicationHashIds/${appHash.hashId}`)
      const paymentRef = doc(db, `_payments/${payment.id}`)
      const paymentHashRef = payment.hashId ? doc(db, `_paymentHashes/${payment.hashId}`) : null

      await runTransaction(db, async tx => {
        tx.delete(appOverviewRef)
        tx.delete(appLinksRef)
        tx.delete(appMetaRef)
        tx.delete(appRef)
        tx.delete(appHashRef)
        tx.delete(paymentRef)

        if (paymentHashRef) {
          tx.delete(paymentHashRef)
        }
      })
        .catch(err => { throw err })

      const circleCutRef = ref(storage, `circleCuts/${appHash.hashId}`)
      await deleteObject(circleCutRef)
        .catch((err: Error) => {
          if (err.message.includes('storage/object-not-found')) {
            console.error(err)
            return
          }
          throw err
        })
    }, [])

  const getCircleCutURLByHashIdAsync =
    useCallback(async (hashId: string): Promise<string> => {
      const storage = getStorage()
      const circleCutRef = ref(storage, `/circleCuts/${hashId}`)
      const circleCutURL = await getDownloadURL(circleCutRef)
      return circleCutURL
    }, [])

  const getCircleCutURLByHashIdNullableAsync =
    useCallback(async (hashId: string): Promise<string | null> => {
      return await getCircleCutURLByHashIdAsync(hashId)
        .catch(() => null)
    }, [])

  const getOverviewByIdNullableAsync =
    useCallback(async (appId: string) => {
      const appOverviewRef = doc(db, `_applicationOverviews/${appId}`)
      return await getDoc(appOverviewRef)
        .then(doc => doc.data() as SockbaseApplicationOverviewDocument)
        .catch(() => null)
    }, [])

  return {
    getApplicationIdByHashIdAsync,
    getApplicationByIdAsync,
    getApplicationsByEventIdAsync,
    getLinksByApplicationIdAsync,
    setApplicationStatusByIdAsync,
    deleteApplicationAsync,
    getCircleCutURLByHashIdNullableAsync,
    getOverviewByIdNullableAsync
  }
}

export default useApplication
