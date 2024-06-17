import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdAssignmentTurnedIn, MdCheck, MdDownload } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormButton from '../../components/Form/Button'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import FormInput from '../../components/Form/Input'
import FormLabel from '../../components/Form/Label'
import Alert from '../../components/Parts/Alert'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import LoadingCircleWrapper from '../../components/Parts/LoadingCircleWrapper'
import useApplication from '../../hooks/useApplication'
import useDayjs from '../../hooks/useDayjs'
import useEvent from '../../hooks/useEvent'
import useFile from '../../hooks/useFile'
import useSpace from '../../hooks/useSpace'
import DashboardBaseLayout from '../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../layouts/DashboardBaseLayout/PageTitle'
import type { ImportedSpace } from '../../@types'
import type { SockbaseApplicationMeta, SockbaseApplicationDocument, SockbaseEvent, SockbaseSpaceDocument } from 'sockbase'

const DashboardEventSpacesPage: React.FC = () => {
  const { eventId } = useParams()
  const { getEventByIdAsync, getSpacesByEventIdAsync } = useEvent()
  const {
    getApplicationsByEventIdAsync,
    getApplicationMetaByIdAsync
  } = useApplication()
  const {
    downloadSpaceDataXLSX,
    readSpaceDataXLSXAsync,
    updateSpaceDataAsync
  } = useSpace()
  const {
    arrayBufferResult: spaceDataWithHook,
    openAsArrayBuffer: openSpaceData
  } = useFile()
  const { formatByDate } = useDayjs()

  const [event, setEvent] = useState<SockbaseEvent>()
  const [spaces, setSpaces] = useState<SockbaseSpaceDocument[]>()
  const [apps, setApps] = useState<Record<string, SockbaseApplicationDocument>>()
  const [metas, setMetas] = useState<Record<string, SockbaseApplicationMeta>>()

  const [spaceDataFile, setSpaceDataFile] = useState<File | null>()
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>()
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>()
  const [spaceImportResult, setSpaceImportResult] = useState<{ eventId: string, spaces: ImportedSpace[] } | null>()
  const [isProgress, setProgress] = useState(false)

  const pageTitle = useMemo(() => {
    if (!event) return ''
    return `${event.eventName} 配置管理`
  }, [event])

  const handleDownload = useCallback(() => {
    if (!eventId || !event || !spaces || !apps || !metas) return
    downloadSpaceDataXLSX(eventId, event, apps, metas)
  }, [eventId, event, spaces, apps, metas])

  const getAppByHashId = useCallback((appHashId: string) => {
    if (!apps) return
    return Object.values(apps).filter(a => a.hashId === appHashId)[0]
  }, [apps])

  const handleUpdate = useCallback(() => {
    if (!eventId || !spaceImportResult) return
    if (!confirm('配置データを適用します。\nよろしいですか？')) return
    setProgress(true)
    setUpdateErrorMessage(null)
    updateSpaceDataAsync(eventId, spaceImportResult.spaces)
      .then(() => alert('配置データを適用しました'))
      .catch(err => {
        setUpdateErrorMessage(err.message)
        throw err
      })
      .finally(() => setProgress(false))
  }, [eventId, spaceImportResult])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!eventId) return

      getEventByIdAsync(eventId)
        .then(fetchedEvent => setEvent(fetchedEvent))
        .catch(err => { throw err })

      getSpacesByEventIdAsync(eventId)
        .then(fetchedSpaces => setSpaces(fetchedSpaces))
        .catch(err => { throw err })

      const fetchedApps = await getApplicationsByEventIdAsync(eventId)
        .catch(err => { throw err })
      setApps(fetchedApps)

      const appIds = Object.keys(fetchedApps)

      Promise.all(appIds.map(async id => ({
        id,
        data: await getApplicationMetaByIdAsync(id)
      })))
        .then(fetchedMetas => {
          const mappedMetas = fetchedMetas.reduce<Record<string, SockbaseApplicationMeta>>((p, c) => ({
            ...p,
            [c.id]: c.data
          }), {})
          setMetas(mappedMetas)
        })
        .catch(err => { throw err })
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [eventId])

  useEffect(() => {
    if (!spaceDataFile) return
    openSpaceData(spaceDataFile)
  }, [spaceDataFile])

  useEffect(() => {
    if (!eventId || !spaceDataWithHook) return
    setLoadErrorMessage(null)
    setSpaceImportResult(null)
    readSpaceDataXLSXAsync(eventId, spaceDataWithHook)
      .then(result => setSpaceImportResult(result))
      .catch(err => {
        setLoadErrorMessage(err.message)
        throw err
      })
  }, [eventId, spaceDataWithHook])

  return (
    <DashboardBaseLayout title={pageTitle} requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/events">管理イベント</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/dashboard/events/${eventId}`}>{event?.eventName ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        title={event?.eventName}
        description="配置管理"
        icon={<MdAssignmentTurnedIn />}
        isLoading={!event} />

      <FormSection>
        <FormItem inlined>
          <FormButton inlined color="default" onClick={handleDownload}>
            <IconLabel label="配置データダウンロード" icon={<MdDownload />} />
          </FormButton>
        </FormItem>
      </FormSection>

      <FormSection>
        <FormItem>
          <FormLabel>
            配置データ
          </FormLabel>
          <FormInput
            type="file"
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={e => setSpaceDataFile(e.target.files?.[0])} />
        </FormItem>
      </FormSection>

      {loadErrorMessage && <Alert type="danger">{loadErrorMessage}</Alert>}

      <table>
        <thead>
          <tr>
            <th>スペース番号</th>
            <th>申し込みID</th>
            <th>サークル名</th>
            <th>ペンネーム</th>
          </tr>
        </thead>
        <tbody>
          {spaceImportResult && spaceImportResult?.spaces.length > 0
            ? spaceImportResult.spaces.map(s => {
              const app = getAppByHashId(s.appHashId)
              return <tr key={s.appHashId}>
                <td>{s.spaceId}</td>
                <td>{s.appHashId}</td>
                <td>{app?.circle.name}</td>
                <td>{app?.circle.penName}</td>
              </tr>
            })
            : <tr>
              <td colSpan={4}>配置データを選択してください</td>
            </tr>}
        </tbody>
      </table>

      {event && <p>
        配置情報は <b>{formatByDate(event.schedules.publishSpaces, 'YYYY年 M月 D日 H時mm分')}</b> に自動公開されます。<br />
        公開日時を変更する場合はシステム管理者までお問い合わせください。
      </p>}

      <FormSection>
        <FormItem>
          <LoadingCircleWrapper isLoading={isProgress} inlined>
            <FormButton
              disabled={!spaceImportResult || isProgress}
              onClick={handleUpdate}
              inlined>
              <IconLabel label="配置データを適用する" icon={<MdCheck />} />
            </FormButton>
          </LoadingCircleWrapper>
        </FormItem>
      </FormSection>

      {updateErrorMessage && <Alert type="danger">{updateErrorMessage}</Alert>}

    </DashboardBaseLayout>
  )
}

export default DashboardEventSpacesPage
