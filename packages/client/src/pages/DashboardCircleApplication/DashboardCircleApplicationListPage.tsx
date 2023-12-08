import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MdCollectionsBookmark } from 'react-icons/md'
import type { SockbaseApplicationDocument, SockbaseApplicationMeta, SockbaseEvent } from 'sockbase'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import CircleApplicationList from './CircleApplicationList'
import useFirebase from '../../hooks/useFirebase'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import Loading from '../../components/Parts/Loading'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'

const DashboardCircleApplicationListPage: React.FC = () => {
  const { user } = useFirebase()
  const { getApplicationsByUserIdWithIdAsync, getApplicationMetaByIdAsync } = useApplication()
  const { getEventByIdAsync } = useEvent()

  const [apps, setApps] = useState<Record<string, SockbaseApplicationDocument>>()
  const [metas, setMetas] = useState<Record<string, SockbaseApplicationMeta>>()
  const [events, setEvents] = useState<Record<string, SockbaseEvent>>()

  const onChangeLoggedInStatus: () => void =
    () => {
      const fetchAppsAsync: () => Promise<void> =
        async () => {
          if (!user) return
          const fetchedApps = await getApplicationsByUserIdWithIdAsync(user.uid)
          setApps(fetchedApps)

          const appIds = Object.keys(fetchedApps)

          const eventIdsSet = Object.values(fetchedApps)
            .map(app => app.eventId)
            .reduce((p, c) => {
              return p.add(c)
            }, new Set<string>())
          const eventIds = [...eventIdsSet]

          const fetchedMetas = await Promise.all(
            appIds.map(async (appId) => ({
              appId,
              data: await getApplicationMetaByIdAsync(appId)
            }))
          )
          const objectMappedMetas = fetchedMetas.reduce<Record<string, SockbaseApplicationMeta>>((p, c) => ({
            ...p,
            [c.appId]: c.data
          }), {})
          setMetas(objectMappedMetas)

          const fetchedEvents = await Promise.all(
            eventIds.map(async (eventId) => (
              {
                eventId,
                ...await getEventByIdAsync(eventId)
              }
            ))
          )
          const objectMappedEvents = fetchedEvents.reduce<Record<string, SockbaseEvent>>((p, c) => ({
            ...p,
            [c.eventId]: c
          }), {})
          setEvents(objectMappedEvents)
        }
      fetchAppsAsync()
        .catch(err => {
          throw err
        })
    }
  useEffect(onChangeLoggedInStatus, [user])

  return (
    <DashboardBaseLayout title="申し込んだイベント" requireSystemRole={0}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdCollectionsBookmark />}
        title="サークル申し込み履歴"
        description="今までに申し込んだイベントの一覧を表示中" />

      {apps && events && metas
        ? <CircleApplicationList apps={apps} metas={metas} events={events} />
        : <Loading text="申し込み履歴" />}
    </DashboardBaseLayout>
  )
}

export default DashboardCircleApplicationListPage
