import { useCallback, useEffect, useState } from 'react'
import { MdAssignmentTurnedIn, MdCheck, MdDownload } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import { type SockbaseApplicationDocument, type SockbaseSpaceDocument, type SockbaseApplicationMeta, type SockbaseEventDocument, SockbaseApplicationOverviewDocument, SockbaseApplicationLinksDocument } from 'sockbase'
import { type ImportedSpace } from '../../@types'
import FormButton from '../../components/Form/FormButton'
import FormInput from '../../components/Form/FormInput'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/FormLabel'
import FormSection from '../../components/Form/FormSection'
import Alert from '../../components/Parts/Alert'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import LoadingCircleWrapper from '../../components/Parts/LoadingCircleWrapper'
import PageTitle from '../../components/Parts/PageTitle'
import useApplication from '../../hooks/useApplication'
import useDayjs from '../../hooks/useDayjs'
import useEvent from '../../hooks/useEvent'
import useFile from '../../hooks/useFile'
import useSpace from '../../hooks/useSpace'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const EventManageSpacePage: React.FC = () => {
  const { eventId } = useParams()

  const { getEventByIdAsync, getSpacesByEventIdAsync } = useEvent()
  const { getApplicationsByEventIdAsync, getOverviewByIdNullableAsync, getLinksByApplicationIdAsync } = useApplication()
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

  const [event, setEvent] = useState<SockbaseEventDocument>()
  const [spaces, setSpaces] = useState<SockbaseSpaceDocument[]>()
  const [apps, setApps] = useState<Array<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>>()
  const [links, setLinks] = useState<Record<string, SockbaseApplicationLinksDocument | null>>()
  const [overviews, setOverviews] = useState<Record<string, SockbaseApplicationOverviewDocument | null>>()

  const [spaceDataFile, setSpaceDataFile] = useState<File | null>()
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>()
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>()
  const [spaceImportResult, setSpaceImportResult] = useState<{ eventId: string, spaces: ImportedSpace[] } | null>()
  const [isProgress, setProgress] = useState(false)

  const handleDownload = useCallback(() => {
    if (!eventId || !event || !spaces || !apps || !overviews || !links) return
    downloadSpaceDataXLSX(eventId, event, apps, links, overviews)
  }, [eventId, event, spaces, apps, links, overviews])

  const getAppByHashId = useCallback((appHashId: string) => {
    return apps?.find(a => a.hashId === appHashId)
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
    if (!eventId) return
    getEventByIdAsync(eventId)
      .then(fetchedEvent => setEvent(fetchedEvent))
      .catch(err => { throw err })
    getSpacesByEventIdAsync(eventId)
      .then(fetchedSpaces => setSpaces(fetchedSpaces))
      .catch(err => { throw err })
    getApplicationsByEventIdAsync(eventId)
      .then(setApps)
      .catch(err => { throw err })
  }, [eventId])

  useEffect(() => {
    if (!apps) return
    const appIds = [...new Set(apps.map(a => a.id))]
    Promise.all(appIds.map(async id => ({
      id,
      overview: await getOverviewByIdNullableAsync(id),
      links: await getLinksByApplicationIdAsync(id)
    })))
      .then(results => {
        const mappedOverviews = Object.fromEntries(results.map(r => [r.id, r.overview]))
        const mappedLinks = Object.fromEntries(results.map(r => [r.id, r.links]))
        setOverviews(mappedOverviews)
        setLinks(mappedLinks)
      })
      .catch(err => { throw err })
  }, [apps])

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
    <DefaultLayout
      requireCommonRole={2}
      title="配置管理">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/events">イベント一覧</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/events/${eventId}`}>{event?.name ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdAssignmentTurnedIn />}
        title="配置管理" />

      <FormSection>
        <FormItem>
          <FormButton
            color="default"
            onClick={handleDownload}>
            <IconLabel
              icon={<MdDownload />}
              label="配置データダウンロード" />
          </FormButton>
        </FormItem>
      </FormSection>

      <FormSection>
        <FormItem>
          <FormLabel>
            配置データ
          </FormLabel>
          <FormInput
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={e => setSpaceDataFile(e.target.files?.[0])}
            type="file" />
        </FormItem>
      </FormSection>

      {loadErrorMessage && (
        <Alert
          title="エラーが発生しました"
          type="error">{loadErrorMessage}
        </Alert>
      )}

      <table>
        <thead>
          <tr>
            <th>スペース番号</th>
            <th>申し込み ID</th>
            <th>サークル名</th>
            <th>ペンネーム</th>
          </tr>
        </thead>
        <tbody>
          {spaceImportResult && spaceImportResult?.spaces.length > 0
            ? spaceImportResult.spaces.map(s => {
              const app = getAppByHashId(s.appHashId)
              return (
                <tr key={s.appHashId}>
                  <td>{s.spaceId}</td>
                  <td>{s.appHashId}</td>
                  <td>{app?.circle.name}</td>
                  <td>{app?.circle.penName}</td>
                </tr>
              )
            })
            : (
              <tr>
                <td colSpan={4}>配置データを選択してください</td>
              </tr>
            )}
        </tbody>
      </table>

      {event && (
        <p>
          配置情報は <b>{formatByDate(event.schedules.publishSpaces, 'YYYY年 M月 D日 H時mm分')}</b> に自動公開されます。<br />
          公開日時を変更する場合はシステム管理者までお問い合わせください。
        </p>
      )}

      <FormSection>
        <FormItem>
          <LoadingCircleWrapper
            inlined
            isLoading={isProgress}>
            <FormButton
              disabled={!spaceImportResult || isProgress}
              onClick={handleUpdate}>
              <IconLabel
                icon={<MdCheck />}
                label="配置データを適用する" />
            </FormButton>
          </LoadingCircleWrapper>
        </FormItem>
      </FormSection>

      {updateErrorMessage && (
        <Alert
          title="エラーが発生しました"
          type="error">{updateErrorMessage}
        </Alert>
      )}
    </DefaultLayout>
  )
}

export default EventManageSpacePage
