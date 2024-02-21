import { useEffect, useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MdEditCalendar } from 'react-icons/md'
import {
  type SockbaseSpaceDocument,
  type SockbaseApplicationDocument,
  type SockbaseApplicationHashIdDocument,
  type SockbaseApplicationMeta,
  type SockbaseEvent,
  type SockbaseApplicationLinksDocument
} from 'sockbase'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import EventApplications from './EventCircleApplications'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import Loading from '../../components/Parts/Loading'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import BlinkField from '../../components/Parts/BlinkField'
import CopyToClipboard from '../../components/Parts/CopyToClipboard'

const DashboardEventApplicationsPage: React.FC = () => {
  const { eventId } = useParams()
  const {
    getApplicationsByEventIdAsync,
    getApplicationMetaByIdAsync,
    getApplicationIdByHashedIdAsync,
    getLinksByApplicationIdOptionalAsync,
    exportCSV
  } = useApplication()
  const { getEventByIdAsync, getSpacesAsync } = useEvent()

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

          getSpacesAsync(eventId)
            .then(fetchedSpaces => setSpaces(fetchedSpaces))
            .catch(err => { throw err })

          const fetchedApps = await getApplicationsByEventIdAsync(eventId)
          setApps(fetchedApps)

          const appIds = Object.keys(fetchedApps)
          const appHashIds = Object.values(fetchedApps)
            .map(a => a.hashId)

          Promise.all(appIds.map(async (appId) => ({
            appId,
            data: await getApplicationMetaByIdAsync(appId)
          })))
            .then(fetchedMetas => {
              const objectMappedMetas = fetchedMetas.reduce<Record<string, SockbaseApplicationMeta>>((p, c) => ({
                ...p,
                [c.appId]: c.data
              }), {})
              setMetas(objectMappedMetas)
            })
            .catch(err => { throw err })

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

          Promise.all(appIds.map(async appId => ({
            appId,
            data: await getLinksByApplicationIdOptionalAsync(appId)
          })))
            .then(fetchedLinks => {
              const objectMappedLinks = fetchedLinks.reduce<Record<string, SockbaseApplicationLinksDocument | null>>((p, c) => ({
                ...p,
                [c.appId]: c.data
              }), {})

              const appsCSV = exportCSV(fetchedApps, objectMappedLinks)
              setAppsCSV(appsCSV)
            })
            .catch(err => { throw err })
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
    <DashboardBaseLayout title={title} requireSystemRole={2}>
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
