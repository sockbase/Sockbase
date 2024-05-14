import { useCallback } from 'react'
import saveAs from 'file-saver'
import * as FirestoreDB from 'firebase/firestore'
import * as FirebaseFunctions from 'firebase/functions'
import * as FirebaseStorage from 'firebase/storage'
import * as XLSX from 'xlsx'
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
  exportCSV: (
    apps: Record<string, sockbase.SockbaseApplicationDocument>,
    metas: Record<string, sockbase.SockbaseApplicationMeta>,
    users: Record<string, sockbase.SockbaseAccount>,
    links: Record<string, sockbase.SockbaseApplicationLinksDocument | null>,
    overviews: Record<string, sockbase.SockbaseApplicationOverviewDocument | null>
  ) => string
  downloadXLSX: (
    eventId: string,
    event: sockbase.SockbaseEvent,
    apps: Record<string, sockbase.SockbaseApplicationDocument>,
    metas: Record<string, sockbase.SockbaseApplicationMeta>,
    users: Record<string, sockbase.SockbaseAccount>,
    links: Record<string, sockbase.SockbaseApplicationLinksDocument | null>,
    overviews: Record<string, sockbase.SockbaseApplicationOverviewDocument | null>
  ) => void
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

  const getApplicationByIdAsync = async (appId: string):
  Promise<sockbase.SockbaseApplicationDocument & { meta: sockbase.SockbaseApplicationMeta }> => {
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

  const getApplicationsByUserIdWithIdAsync = async (
    userId: string
  ): Promise<Record<string, sockbase.SockbaseApplicationDocument>> => {
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
    const metaRef = FirestoreDB.doc(db, '_applications', appId, 'private', 'meta')
      .withConverter(applicationMetaConverter)
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

  const deleteApplicationAsync = async (appHashId: string): Promise<void> => {
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
      .catch(err => { throw err })
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

  const getCircleCutURLByHashedIdNullableAsync = async (hashId: string): Promise<string | null> =>
    await getCircleCutURLByHashedIdAsync(hashId)
      .catch(err => {
        console.error(err)
        return null
      })

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
    metas: Record<string, sockbase.SockbaseApplicationMeta>,
    users: Record<string, sockbase.SockbaseAccount>,
    links: Record<string, sockbase.SockbaseApplicationLinksDocument | null>,
    overviews: Record<string, sockbase.SockbaseApplicationOverviewDocument | null>): string => {
    const header =
      'eventId\tid\tstatus\tname\tyomi\tpenName\tgenre\tspace\thasAdult\tunionId\tdescription\ttotalAmount\tremarks\ttwitter\tpixiv\tweb\tmenu\tuserId\temail'
    const entries = Object.entries(apps)
      .map(([id, a]) => [
        a.eventId,
        a.hashId,
        metas[id]?.applicationStatus,
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
        a.userId,
        users[a.userId]?.email
      ])
      .map((a) => a.join('\t'))
      .join('\n')

    return `${header}\n${entries}\n`
  }

  const downloadXLSX = (
    eventId: string,
    event: sockbase.SockbaseEvent,
    apps: Record<string, sockbase.SockbaseApplicationDocument>,
    metas: Record<string, sockbase.SockbaseApplicationMeta>,
    users: Record<string, sockbase.SockbaseAccount>,
    links: Record<string, sockbase.SockbaseApplicationLinksDocument | null>,
    overviews: Record<string, sockbase.SockbaseApplicationOverviewDocument | null>
  ): void => {
    const workbook = XLSX.utils.book_new()

    const spaceDataSheet = XLSX.utils.aoa_to_sheet([
      [`${event.eventName} スペースデータ作成`],
      [''],
      ['配置データを作成するには、まずスペースデータを作成する必要があります。'],
      ['作成したスペースデータの「スペースID」を2枚目の「配置データ」シートのA行に入力してください。'],
      [''],
      ['＜スペースデータ入力の方法＞'],
      ['「スペースID」一意の連番を振ってください'],
      ['「スペース番号」スペース番号として使用する文字列を入力してください'],
      [''],
      ['スペースID', 'スペース番号'],
      [1, 'A-01'],
      [2, 'A-02'],
      [3, 'A-03, 04']
    ])

    const appsArray = Object.entries(apps)
      .filter(([id, _]) => metas[id].applicationStatus === 2)
      .map(([id, a], i) => {
        const unionCircle = Object.values(apps).filter(uc => uc.hashId === a.unionCircleId)[0]
        const space = event.spaces.filter(s => s.id === a.spaceId)[0]
        const genre = event.genres.filter(g => g.id === a.circle.genre)[0]

        return [
          null,
          { t: 'n', f: `=VLOOKUP($A${12 + i}, スペースデータ!A:B, 2, FALSE)` },
          a.hashId,
          a.circle.name,
          a.circle.yomi,
          a.circle.penName,
          genre.name,
          space.name,
          a.circle.hasAdult,
          unionCircle?.circle.name,
          (overviews[id]?.description ?? a.overview.description)
            .replaceAll(',', '，')
            .replaceAll(/[\r\n]+/g, ' '),
          (overviews[id]?.totalAmount ?? a.overview.totalAmount)
            .replaceAll(',', '，')
            .replaceAll(/[\r\n]+/g, ' '),
          a.remarks,
          links[id]?.twitterScreenName,
          links[id]?.pixivUserId,
          links[id]?.websiteURL,
          links[id]?.menuURL,
          a.userId,
          users[a.userId]?.email
        ]
      })

    const applicationDataSheet = XLSX.utils.aoa_to_sheet([
      [`${event.eventName} 配置データ作成`],
      [''],
      ['1枚目の「スペースデータ」シートで作成したスペースデータをもとに、実際の配置データを作成します。'],
      [''],
      ['＜配置データの作成方法＞'],
      ['「スペースID」スペースデータシートで作成したIDを入力してください'],
      ['・スペースIDを入力すると B列 にスペース番号が表示されます。'],
      ['・正しいスペース番号が表示されているか必ず確認してください。'],
      [''],
      ['', '→B列以降は変更しても反映されません。'],
      [
        'スペースID',
        'スペース番号',
        '申し込みID',
        'サークル名',
        'よみ',
        'ペンネーム',
        'ジャンル',
        'スペース',
        '成人向け',
        '合体サークル',
        '頒布物概要',
        '総搬入量',
        '備考',
        'Twitter',
        'Pixiv',
        'Web',
        'お品書き',
        'ユーザID',
        'メールアドレス'
      ],
      ...appsArray
    ])

    XLSX.utils.book_append_sheet(workbook, spaceDataSheet, 'スペースデータ')
    XLSX.utils.book_append_sheet(workbook, applicationDataSheet, '配置データ')

    const excelUnit8Array = XLSX.write(workbook, { type: 'array' })
    const excelBlob = new Blob(
      [excelUnit8Array],
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    const now = new Date().getTime()
    saveAs(excelBlob, `${eventId}_${now}`)
  }

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
    setOverviewByApplicationIdAsync,
    exportCSV,
    downloadXLSX
  }
}

export default useApplication
