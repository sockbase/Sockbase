import { useCallback } from 'react'
import saveAs from 'file-saver'
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  where,
  writeBatch
} from 'firebase/firestore'
import * as XLSX from 'xlsx'
import { type ImportedSpace } from '../@types'
import { applicationHashIdConverter, spaceConverter, spaceHashConverter } from '../libs/converters'
import useDayjs from './useDayjs'
import useFirebase from './useFirebase'
import type {
  SockbaseApplicationDocument,
  SockbaseApplicationMeta,
  SockbaseAccount,
  SockbaseApplicationLinksDocument,
  SockbaseApplicationOverviewDocument,
  SockbaseEvent,
  SockbaseSpaceDocument
} from 'sockbase'

interface IUseSpace {
  exportCSV: (
    apps: Record<string, SockbaseApplicationDocument>,
    metas: Record<string, SockbaseApplicationMeta>,
    users: Record<string, SockbaseAccount>,
    links: Record<string, SockbaseApplicationLinksDocument | null>,
    overviews: Record<string, SockbaseApplicationOverviewDocument | null>
  ) => string
  downloadSpaceDataXLSX: (
    eventId: string,
    event: SockbaseEvent,
    apps: Array<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>
  ) => void
  readSpaceDataXLSXAsync: (eventId: string, spaceFile: ArrayBuffer) => Promise<{ eventId: string, spaces: ImportedSpace[] }>
  updateSpaceDataAsync: (eventId: string, spaces: ImportedSpace[]) => Promise<void>
}

const useSpace = (): IUseSpace => {
  const { getFirestore } = useFirebase()
  const { formatByDate } = useDayjs()

  const exportCSV =
    useCallback((
      apps: Record<string, SockbaseApplicationDocument>,
      metas: Record<string, SockbaseApplicationMeta>,
      users: Record<string, SockbaseAccount>,
      links: Record<string, SockbaseApplicationLinksDocument | null>,
      overviews: Record<string, SockbaseApplicationOverviewDocument | null>) => {
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
    }, [])

  const downloadSpaceDataXLSX =
    useCallback((
      eventId: string,
      event: SockbaseEvent,
      apps: Array<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>
    ) => {
      const now = new Date().getTime()

      const workbook = XLSX.utils.book_new()

      const appsArray = apps
        .filter(a => a.meta.applicationStatus === 2)
        .map(a => {
          return [
            null,
            a.hashId,
            a.spaceId,
            a.circle.name,
            a.circle.yomi,
            a.circle.penName
          ]
        })

      const applicationDataSheet = XLSX.utils.aoa_to_sheet([
        [eventId, `${event.name} 配置データ作成`],
        [formatByDate(now, 'YYYY/MM/DD HH:mm:ss 作成')],
        [''],
        ['', '→B列以降は確認用です。変更しても反映されません。'],
        [
          'スペース番号',
          '申し込みID',
          'スペース',
          'サークル名',
          'サークル名よみ',
          'ペンネーム'
        ],
        ...appsArray
      ])

      XLSX.utils.book_append_sheet(workbook, applicationDataSheet, '配置データ')

      const excelUnit8Array = XLSX.write(workbook, { type: 'array' })
      const excelBlob = new Blob(
        [excelUnit8Array],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

      saveAs(excelBlob, `${eventId}-${formatByDate(now, 'YYYYMMDD-HHmmss')}`)
    }, [])

  const readSpaceDataXLSXAsync =
    useCallback(async (eventId: string, spaceFile: ArrayBuffer) => {
      const spaceDataFile = XLSX.read(spaceFile)
      if (!spaceDataFile.SheetNames.includes('配置データ')) {
        throw new Error('不明なデータが入力されました')
      }

      const sheetData = spaceDataFile.Sheets['配置データ']
      const actualEventId = sheetData.A1?.v
      if (!actualEventId) {
        throw new Error('イベントIDが入力されていません。配置データを再ダウンロードしデータを作成し直してください。')
      } else if (eventId !== actualEventId) {
        throw new Error('異なるイベントの配置データが選択されました。')
      }

      const spaces: ImportedSpace[] = []

      let row = 6
      while (sheetData[`B${row}`]) {
        const space = {
          spaceId: sheetData[`A${row}`]?.v,
          appHashId: sheetData[`B${row}`]?.v
        }
        spaces.push(space)
        row++
      }

      const spaceIds = spaces
        .filter(s => s.spaceId)
        .map(s => s.spaceId)
      const distinctSpaceIds = [...new Set(spaceIds)]
      if (spaceIds.length !== distinctSpaceIds.length) {
        throw new Error('スペースIDが重複して入力されています')
      }

      return { eventId, spaces }
    }, [])

  const updateSpaceDataAsync =
    useCallback(async (eventId: string, spaces: ImportedSpace[]) => {
      const spaceIds = spaces
        .filter(s => s.spaceId)
        .map(s => s.spaceId) as string[]
      if (spaceIds.length === 0) {
        throw new Error('配置設定が必要なサークルがありませんでした')
      }

      const sortedSpaceIds = spaceIds.sort()

      const db = getFirestore()

      const appHashesRef = collection(db, '_applicationHashIds')
        .withConverter(applicationHashIdConverter)
      const appHashesQuery = query(appHashesRef, where('eventId', '==', eventId))
      const appHashesSnapshot = await getDocs(appHashesQuery)
      const appHashes = appHashesSnapshot.docs
        .filter(doc => doc.exists())
        .map(doc => doc.data())

      const appHashIdsToAssign = spaces
        .map(s => s.appHashId)
      const appHashIdsToUpdate = appHashes
        .map(a => a.hashId)

      const appHashIdValidationResult = appHashIdsToAssign.reduce<string[]>((p, id) => {
        if (appHashIdsToUpdate.includes(id)) return p
        return [...p, id]
      }, [])
      if (appHashIdValidationResult.length > 0) {
        throw new Error(`イベントに存在しない申し込みIDが入力されています。(${appHashIdValidationResult.join(', ')})`)
      }

      const spaceHashesRef = collection(db, '_spaceHashes')
        .withConverter(spaceHashConverter)
      const spaceHashesQuery = query(spaceHashesRef, where('eventId', '==', eventId))
      const spaceHashesSnapshot = await getDocs(spaceHashesQuery)
      const spaceHashes = spaceHashesSnapshot.docs
        .filter(doc => doc.exists())
        .map(doc => doc.data())

      await runTransaction(db, async tx => {
        appHashes.forEach(a => {
          const appHashIdRef = doc(db, `_applicationHashIds/${a.id}`)
            .withConverter(applicationHashIdConverter)
          tx.update(appHashIdRef, { spaceId: null })
        })
        spaceHashes.forEach(s => {
          tx.delete(doc(db, `spaces/${s.id}`))
          tx.delete(doc(db, `_spaceHashes/${s.id}`))
        })
      })
        .catch(err => { throw err })

      const spacesRef = collection(db, 'spaces')
        .withConverter(spaceConverter)

      const spaceAddResults = await Promise.all(
        sortedSpaceIds.map(async (spaceId, i) => {
          const spaceDoc: SockbaseSpaceDocument = {
            id: '',
            eventId,
            spaceGroupOrder: 0,
            spaceOrder: i,
            spaceName: spaceId
          }
          const addResult = await addDoc(spacesRef, spaceDoc)
            .catch(err => { throw err })

          const spaceDocId = addResult.id
          const spaceHashRef = doc(db, `_spaceHashes/${spaceDocId}`)
          await setDoc(spaceHashRef, { eventId })
            .catch(err => { throw err })

          return {
            ...spaceDoc,
            id: spaceDocId
          }
        }))

      const updateBatch = writeBatch(db)

      spaces.forEach(s => {
        const space = spaceAddResults.filter(r => r.spaceName === s.spaceId)[0]
        if (!space) {
          throw new Error('スペースデータが見つかりません')
        }

        const appHashDocRef = doc(db, `_applicationHashIds/${s.appHashId}`)
          .withConverter(applicationHashIdConverter)
        updateBatch.set(
          appHashDocRef,
          { spaceId: space.id },
          { merge: true })
      })

      await updateBatch.commit()
        .catch(err => { throw err })
    }, [])

  return {
    exportCSV,
    downloadSpaceDataXLSX,
    readSpaceDataXLSXAsync,
    updateSpaceDataAsync
  }
}

export default useSpace
