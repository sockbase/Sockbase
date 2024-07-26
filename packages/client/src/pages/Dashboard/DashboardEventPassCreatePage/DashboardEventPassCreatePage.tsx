import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdBookOnline } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormButton from '../../../components/Form/Button'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import Alert from '../../../components/Parts/Alert'
import BlinkField from '../../../components/Parts/BlinkField'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import IconLabel from '../../../components/Parts/IconLabel'
import LoadingCircleWrapper from '../../../components/Parts/LoadingCircleWrapper'
import useApplication from '../../../hooks/useApplication'
import useEvent from '../../../hooks/useEvent'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../layouts/TwoColumnsLayout/TwoColumnsLayout'
import type { SockbaseApplicationDocument, SockbaseApplicationMeta, SockbaseEvent } from 'sockbase'

const DashboardEventPassCreatePage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const {
    getEventByIdAsync,
    createPassesAsync
  } = useEvent()
  const {
    getApplicationsByEventIdAsync,
    getApplicationMetaByIdAsync
  } = useApplication()

  const [event, setEvent] = useState<SockbaseEvent>()
  const [apps, setApps] = useState<Record<string, SockbaseApplicationDocument>>()
  const [appMetas, setAppMetas] = useState<Record<string, SockbaseApplicationMeta>>()

  const [isProgress, setProgress] = useState(false)
  const [addedResult, setAddedResult] = useState<number>()

  const getPassCount = useCallback((spaceId: string | null) => {
    if (!event || !apps || !appMetas) return

    const filteredApps = Object.values(apps)
      .filter(a => appMetas[a.id].applicationStatus === 2)
      .filter(a => !spaceId || a.spaceId === spaceId)

    return {
      appCount: filteredApps.length,
      passCount: filteredApps
        .map(s => {
          const space = event.spaces.filter(sp => sp.id === s.spaceId)[0]
          return space.passCount ?? 0
        })
        .reduce((p, c) => p + c, 0)
    }
  }, [event, apps, appMetas])

  const totalPassCount = useMemo(() => getPassCount(null), [getPassCount])

  const handleCreate = useCallback(() => {
    if (!eventId || !totalPassCount) return
    if (!confirm(`${totalPassCount.passCount}件の通行証を発券します\nよろしいですか？`)) return
    setProgress(true)
    createPassesAsync(eventId)
      .then(result => {
        setAddedResult(result)
      })
      .catch(err => {
        setProgress(false)
        alert('発券時にエラーが発生しました')
        throw err
      })
  }, [eventId, totalPassCount])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!eventId) return
      getEventByIdAsync(eventId)
        .then(fetchedEvent => setEvent(fetchedEvent))
        .catch(err => { throw err })

      const fetchedApps = await getApplicationsByEventIdAsync(eventId)
        .catch(err => { throw err })
      setApps(fetchedApps)

      const appIds = Object.keys(fetchedApps)
      Promise.all(appIds.map(async id => ({
        id,
        data: await getApplicationMetaByIdAsync(id)
      })))
        .then(fetchedAppMetas => {
          const mappedAppMetas = fetchedAppMetas.reduce<Record<string, SockbaseApplicationMeta>>((p, c) => ({
            ...p,
            [c.id]: c.data
          }), {})
          setAppMetas(mappedAppMetas)
        })
        .catch(err => { throw err })
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [eventId])

  return (
    <DashboardBaseLayout requireCommonRole={2} title="サークル通行証発券">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/events">管理イベント</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/dashboard/events/${eventId}`}>{event?.name ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        title={event?.name}
        description="サークル通行証発券"
        icon={<MdBookOnline />}
        isLoading={!event} />

      <p>
        通行証の発券枚数を変更したい場合はシステム管理者までお問い合わせください。
      </p>

      <TwoColumnsLayout>
        <>
          <table>
            <thead>
              <th>スペース (枚数)</th>
              <th>サークル</th>
              <th>発券予定枚数</th>
            </thead>
            <tbody>
              {event?.spaces.map(s => {
                const c = getPassCount(s.id)
                return (<tr key={s.id}>
                  <td>{s.name} ({s.passCount?.toLocaleString() ?? 0} 枚)</td>
                  <td>{c?.appCount ?? 0} 件</td>
                  <td>{c?.passCount ?? 0} 枚</td>
                </tr>)
              })}
              {totalPassCount && <tr>
                <td>- 合計 -</td>
                <td>{totalPassCount.appCount} 件</td>
                <td>{totalPassCount.passCount} 枚</td>
              </tr>}
            </tbody>
          </table>

          <FormSection>
            <FormItem>
              <LoadingCircleWrapper isLoading={isProgress && addedResult === undefined} inlined>
                <FormButton onClick={handleCreate} disabled={isProgress} inlined>
                  <IconLabel label="通行証発券" icon={<MdBookOnline />} />
                </FormButton>
              </LoadingCircleWrapper>
            </FormItem>
          </FormSection>

          {addedResult !== undefined && <Alert type="success">
            {addedResult} 枚発行しました
          </Alert>}
        </>
        <>
        </>
      </TwoColumnsLayout>
    </DashboardBaseLayout>
  )
}

export default DashboardEventPassCreatePage
