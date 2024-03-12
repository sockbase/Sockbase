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
  uploadCircleCutFileAsync: (appHashId: string, circleCutFile: File) => Promise<void>
  getApplicationMetaByIdAsync: (appId: string) => Promise<sockbase.SockbaseApplicationMeta>
  updateApplicationStatusByIdAsync: (appId: string, status: sockbase.SockbaseApplicationStatus) => Promise<void>
  getCircleCutURLByHashedIdAsync: (hashedAppId: string) => Promise<string>
  getLinksByApplicationIdAsync: (appId: string) => Promise<sockbase.SockbaseApplicationLinksDocument | null>
  getLinksByApplicationIdOptionalAsync: (appId: string) => Promise<sockbase.SockbaseApplicationLinksDocument | null>
  setLinksByApplicationIdAsync: (appId: string, links: sockbase.SockbaseApplicationLinks) => Promise<void>
  getOverviewByApplicationIdAsync: (appId: string) => Promise<sockbase.SockbaseApplicationOverviewDocument | null>
  getOverviewByApplicationIdOptionalAsync: (appId: string) => Promise<sockbase.SockbaseApplicationOverviewDocument | null>
  setOverviewByApplicationIdAsync: (appId: string, overview: sockbase.SockbaseApplicationOverview) => Promise<void>
  exportCSV: (
    apps: Record<string, sockbase.SockbaseApplicationDocument>,
    links: Record<string, sockbase.SockbaseApplicationLinksDocument | null>,
    overviews: Record<string, sockbase.SockbaseApplicationOverviewDocument | null>
  ) => string
}

const useApplication = (): IUseApplication => {
  const { user, getFirestore, getStorage, getFunctions } = useFirebase()

  const getApplicationIdByHashedIdAsync = async (
    hashedAppId: string
  ): Promise<sockbase.SockbaseApplicationHashIdDocument> => {
    const db = getFirestore()
    const hashIdMVRef = FirestoreDB.doc(
      db,
      '_applicationHashIds',
      hashedAppId
    ).withConverter(applicationHashIdConverter)

    const hashIdMVDoc = await FirestoreDB.getDoc(hashIdMVRef)
    if (!hashIdMVDoc.exists()) {
      throw new Error('hashId not found')
    }
    return hashIdMVDoc.data()
  }

  const getApplicationByIdAsync = async (appId: string):
  Promise<sockbase.SockbaseApplicationDocument & { meta: sockbase.SockbaseApplicationMeta }> => {
    const db = getFirestore()

    const appRef = FirestoreDB.doc(db, '_applications', appId).withConverter(
      applicationConverter
    )
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

  const getApplicationByIdOptionalAsync = async (appId: string):
  Promise<(sockbase.SockbaseApplicationDocument & { meta: sockbase.SockbaseApplicationMeta }) | null> =>
    await getApplicationByIdAsync(appId)
      .catch(err => {
        console.error(err)
        return null
      })

  const getApplicationsByUserIdAsync = async (
    userId: string
  ): Promise<sockbase.SockbaseApplicationDocument[]> => {
    const db = getFirestore()
    const appsRef = FirestoreDB.collection(db, '_applications').withConverter(
      applicationConverter
    )

    const appsQuery = FirestoreDB.query(
      appsRef,
      FirestoreDB.where('userId', '==', userId)
    )
    const querySnapshot = await FirestoreDB.getDocs(appsQuery)
    const queryDocs = querySnapshot.docs
      .filter((doc) => doc.exists())
      .map((doc) => doc.data())

    return queryDocs
  }

  const getApplicationsByUserIdWithIdAsync = async (
    userId: string
  ): Promise<Record<string, sockbase.SockbaseApplicationDocument>> => {
    const db = getFirestore()
    const appsRef = FirestoreDB.collection(db, '_applications').withConverter(
      applicationConverter
    )

    const appsQuery = FirestoreDB.query(
      appsRef,
      FirestoreDB.where('userId', '==', userId)
    )
    const querySnapshot = await FirestoreDB.getDocs(appsQuery)
    const queryDocs = querySnapshot.docs
      .filter((doc) => doc.exists())
      .reduce<Record<string, sockbase.SockbaseApplicationDocument>>(
      (p, c) => ({ ...p, [c.id]: c.data() }),
      {}
    )

    return queryDocs
  }

  const getApplicationsByEventIdAsync = async (
    eventId: string
  ): Promise<Record<string, sockbase.SockbaseApplicationDocument>> => {
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

  const getApplicationMetaByIdAsync = async (
    appId: string
  ): Promise<sockbase.SockbaseApplicationMeta> => {
    const db = getFirestore()
    const metaRef = FirestoreDB.doc(
      db,
      '_applications',
      appId,
      'private',
      'meta'
    ).withConverter(applicationMetaConverter)
    const metaDoc = await FirestoreDB.getDoc(metaRef)
    if (!metaDoc.exists()) {
      throw new Error('meta not found')
    }

    return metaDoc.data()
  }

  const submitApplicationAsync = async (
    payload: sockbase.SockbaseApplicationPayload
  ): Promise<sockbase.SockbaseApplicationAddedResult> => {
    const functions = getFunctions()
    const createApplicationFunction = FirebaseFunctions.httpsCallable<
    sockbase.SockbaseApplicationPayload,
    sockbase.SockbaseApplicationAddedResult
    >(functions, 'application-createApplication')

    const appResult = await createApplicationFunction(payload)
    return appResult.data
  }

  const uploadCircleCutFileAsync = async (
    appHashId: string,
    circleCutFile: File
  ): Promise<void> => {
    const storage = getStorage()
    const circleCutRef = FirebaseStorage.ref(storage, `circleCuts/${appHashId}`)
    await FirebaseStorage.uploadBytes(circleCutRef, circleCutFile)
  }

  const updateApplicationStatusByIdAsync = async (
    appId: string,
    status: sockbase.SockbaseApplicationStatus
  ): Promise<void> => {
    const db = getFirestore()
    const metaRef = FirestoreDB.doc(
      db,
      '_applications',
      appId,
      'private',
      'meta'
    ).withConverter(applicationMetaConverter)

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

  const getCircleCutURLByHashedIdAsync = async (
    hashedAppId: string
  ): Promise<string> => {
    const storage = getStorage()
    const circleCutRef = FirebaseStorage.ref(
      storage,
      `/circleCuts/${hashedAppId}`
    )
    const circleCutURL = await FirebaseStorage.getDownloadURL(circleCutRef)
    return circleCutURL
  }

  const getLinksByApplicationIdAsync = async (
    appId: string
  ): Promise<sockbase.SockbaseApplicationLinksDocument | null> => {
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

  const getLinksByApplicationIdOptionalAsync = async (
    appId: string
  ): Promise<sockbase.SockbaseApplicationLinksDocument | null> => {
    return await getLinksByApplicationIdAsync(appId).catch(() => null)
  }

  const setLinksByApplicationIdAsync = useCallback(
    async (
      appId: string,
      links: sockbase.SockbaseApplicationLinks
    ): Promise<void> => {
      if (!user) return

      const db = getFirestore()
      const linksRef = FirestoreDB.doc(
        db,
        '_applicationLinks',
        appId
      ).withConverter(applicationLinksConverter)

      const linksDoc: sockbase.SockbaseApplicationLinksDocument = {
        ...links,
        id: '',
        applicationId: appId,
        userId: user.uid
      }

      await FirestoreDB.setDoc(linksRef, linksDoc).catch((err) => {
        throw err
      })
    },
    [user]
  )

  const getOverviewByApplicationIdAsync = async (appId: string): Promise<sockbase.SockbaseApplicationOverviewDocument | null> => {
    const db = getFirestore()
    const overviewDoc = FirestoreDB.doc(db, '_applicationOverviews', appId)
      .withConverter(overviewConverter)

    const overview = await FirestoreDB.getDoc(overviewDoc)
    if (!overview.exists()) {
      return null
    }

    return overview.data()
  }

  const getOverviewByApplicationIdOptionalAsync = async (appId: string): Promise<sockbase.SockbaseApplicationOverviewDocument | null> =>
    await getOverviewByApplicationIdAsync(appId)
      .then((fetchedOverview) => fetchedOverview)
      .catch(err => {
        console.error(err)
        return null
      })

  const setOverviewByApplicationIdAsync = useCallback(async (appId: string, overview: sockbase.SockbaseApplicationOverview) => {
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

  const exportCSV = (
    apps: Record<string, sockbase.SockbaseApplicationDocument>,
    links: Record<string, sockbase.SockbaseApplicationLinksDocument | null>,
    overviews: Record<string, sockbase.SockbaseApplicationOverviewDocument | null>): string => {
    const header =
      'id\tname\tyomi\tpenName\tgenre\tspace\thasAdult\tunionId\tdescription\ttotalAmount\tremarks\ttwitter\tpixiv\tweb\tmenu\tuserId'
    const entries = Object.entries(apps)
      .map(([id, a]) => [
        a.hashId,
        a.circle.name,
        a.circle.yomi,
        a.circle.penName,
        a.circle.genre,
        a.spaceId,
        a.circle.hasAdult ? '1' : '0',
        a.unionCircleId || 'null',
        (overviews[id]?.description ?? a.overview.description)
          .replaceAll(',', '，')
          .replaceAll(/[\r\n]+/g, ' '),
        (overviews[id]?.totalAmount ?? a.overview.totalAmount)
          .replaceAll(',', '，')
          .replaceAll(/[\r\n]+/g, ' '),
        a.remarks.replaceAll(',', '，').replaceAll(/[\r\n]+/g, ' '),
        links[id]?.twitterScreenName,
        links[id]?.pixivUserId,
        links[id]?.websiteURL,
        links[id]?.menuURL,
        a.userId
      ])
      .map((a) => a.join('\t'))
      .join('\n')

    return `${header}\n${entries}\n`
  }

  return {
    getApplicationIdByHashedIdAsync,
    getApplicationByIdAsync,
    getApplicationByIdOptionalAsync,
    getApplicationsByUserIdAsync,
    getApplicationsByUserIdWithIdAsync,
    getApplicationsByEventIdAsync,
    submitApplicationAsync,
    uploadCircleCutFileAsync,
    getApplicationMetaByIdAsync,
    updateApplicationStatusByIdAsync,
    getCircleCutURLByHashedIdAsync,
    getLinksByApplicationIdAsync,
    getLinksByApplicationIdOptionalAsync,
    setLinksByApplicationIdAsync,
    getOverviewByApplicationIdAsync,
    getOverviewByApplicationIdOptionalAsync,
    setOverviewByApplicationIdAsync,
    exportCSV
  }
}

export default useApplication
