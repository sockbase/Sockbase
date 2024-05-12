import { useEffect, useState, useMemo } from 'react'
import { MdEditCalendar } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import {
  type SockbaseSpaceDocument,
  type SockbaseApplicationDocument,
  type SockbaseApplicationHashIdDocument,
  type SockbaseApplicationMeta,
  type SockbaseEvent,
  type SockbaseApplicationLinksDocument,
  type SockbaseApplicationOverviewDocument,
  type SockbaseAccount
} from 'sockbase'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import AnchorButton from '../../components/Parts/AnchorButton'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import CopyToClipboard from '../../components/Parts/CopyToClipboard'
import LinkButton from '../../components/Parts/LinkButton'
import Loading from '../../components/Parts/Loading'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import useUserData from '../../hooks/useUserData'
import EventApplications from './EventCircleApplications'

const DashboardEventApplicationsPage: React.FC = () => {
  const { eventId } = useParams()
  const {
    getApplicationsByEventIdAsync,
    getApplicationMetaByIdAsync,
    getApplicationIdByHashedIdAsync,
    getLinksByApplicationIdOptionalAsync,
    getOverviewByApplicationIdOptionalAsync,
    exportCSV
  } = useApplication()
  const {
    getEventByIdAsync,
    getSpacesByEventIdAsync
  } = useEvent()
  const {
    getUserDataByUserIdAndEventIdAsync
  } = useUserData()

  const [event, setEvent] = useState<SockbaseEvent>()
  const [apps, setApps] = useState<Record<string, SockbaseApplicationDocument>>()
  const [appHashs, setAppHashs] = useState<SockbaseApplicationHashIdDocument[]>()
  const [metas, setMetas] = useState<Record<string, SockbaseApplicationMeta>>()
  const [spaces, setSpaces] = useState<SockbaseSpaceDocument[]>()
  const [appsCSV, setAppsCSV] = useState<string>()

  const onInitialize: () => void =
    () => {
      const fetchAppsAsync: () => Promise<void> =
        async () => {
          if (!eventId) return

          getEventByIdAsync(eventId)
            .then(fetchedEvent => setEvent(fetchedEvent))
            .catch(err => { throw err })

          getSpacesByEventIdAsync(eventId)
            .then(fetchedSpaces => setSpaces(fetchedSpaces))
            .catch(err => { throw err })

          const fetchedApps = await getApplicationsByEventIdAsync(eventId)
          setApps(fetchedApps)

          const appIds = Object.keys(fetchedApps)
          const appHashIds = Object.values(fetchedApps)
            .map(a => a.hashId)
          const userIds = Object.values(fetchedApps)
            .map(a => a.userId)

          const fetchedMetas = await Promise.all(appIds.map(async (appId) => ({
            appId,
            data: await getApplicationMetaByIdAsync(appId)
          })))
            .then(fetchedMetas => {
              const objectMappedMetas = fetchedMetas.reduce<Record<string, SockbaseApplicationMeta>>((p, c) => ({
                ...p,
                [c.appId]: c.data
              }), {})
              return objectMappedMetas
            })
            .catch(err => { throw err })
          setMetas(fetchedMetas)

          Promise.all(appHashIds.map(async (hashId) => {
            if (!hashId) return
            return await getApplicationIdByHashedIdAsync(hashId)
          }))
            .then(fetchedHashs => {
              const filteredHashs = fetchedHashs
                .reduce<SockbaseApplicationHashIdDocument[]>((p, c) => {
                if (c === undefined) return p
                return [...p, c]
              }, [])
              setAppHashs(filteredHashs)
            })
            .catch(err => { throw err })

          const fetchedMappedLinks = await Promise.all(appIds.map(async appId => ({
            appId,
            data: await getLinksByApplicationIdOptionalAsync(appId)
          })))
            .then(fetchedLinks => {
              const objectMappedLinks = fetchedLinks.reduce<Record<string, SockbaseApplicationLinksDocument | null>>((p, c) => ({
                ...p,
                [c.appId]: c.data
              }), {})
              return objectMappedLinks
            })
            .catch(err => { throw err })

          const fetchedMappedOverviews = await Promise.all(appIds.map(async appId => ({
            appId,
            data: await getOverviewByApplicationIdOptionalAsync(appId)
          })))
            .then(fetchedOverviews => {
              const objectMappedOverviews = fetchedOverviews.reduce<Record<string, SockbaseApplicationOverviewDocument | null>>((p, c) => ({
                ...p,
                [c.appId]: c.data
              }), {})
              return objectMappedOverviews
            })
            .catch(err => { throw err })

          const fetchedUserDatas = await Promise.all(userIds.map(async userId => ({
            userId,
            data: await getUserDataByUserIdAndEventIdAsync(userId, eventId)
          })))
            .then(fetchedUserDatas => {
              const objectMappedUserDatas = fetchedUserDatas.reduce<Record<string, SockbaseAccount>>((p, c) => ({
                ...p,
                [c.userId]: c.data
              }), {})
              return objectMappedUserDatas
            })
            .catch(err => { throw err })

          const appsCSV = exportCSV(fetchedApps, fetchedMetas, fetchedUserDatas, fetchedMappedLinks, fetchedMappedOverviews)
          setAppsCSV(appsCSV)
        }

      fetchAppsAsync()
        .catch(err => {
          throw err
        })
    }
  useEffect(onInitialize, [eventId])

  const title = useMemo(() => {
    if (!event) return '申し込み一覧を読み込み中'
    return `${event.eventName} 申し込み一覧`
  }, [event])

  return (
    <DashboardBaseLayout title={title} requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/events">管理イベント</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEditCalendar />}
        title={event?.eventName}
        description="申し込みサークル一覧"
        isLoading={!event} />
      <FormSection>
        <FormItem inlined>
          <LinkButton to={`/dashboard/events/${eventId}/spaces`} color="default" inlined>配置管理</LinkButton>
          <AnchorButton href={`/dashboard/events/${eventId}/tanzaku`} color="default" inlined target="_blank">配置短冊印刷</AnchorButton>
          <LinkButton to={`/dashboard/events/${eventId}/info`} color="default" inlined>メタ情報参照</LinkButton>
          <AnchorButton href={`/events/${eventId}`} color="default" inlined target="_blank">申し込みページを開く</AnchorButton>
        </FormItem>
      </FormSection>

      {appsCSV && <p>
        配置データCSVをコピー <CopyToClipboard content={appsCSV} />
      </p>}

      {event && apps && metas && appHashs && spaces
        ? <EventApplications
          event={event}
          apps={apps}
          metas={metas}
          appHashs={appHashs}
          spaces={spaces} />
        : <Loading text="申し込み一覧" />}
    </DashboardBaseLayout>
  )
}

export default DashboardEventApplicationsPage
