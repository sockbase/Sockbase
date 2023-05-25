import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { SockbaseApplicationDocument, SockbaseApplicationMeta, SockbaseEvent } from 'sockbase'

import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import EventApplications from '../../../components/pages/dashboard/Events/EventApplications'

import useApplication from '../../../hooks/useApplication'
import useEvent from '../../../hooks/useEvent'
import Loading from '../../../components/Parts/Loading'

const EventApplicationsContainer: React.FC = () => {
  const { eventId } = useParams()
  const { getApplicationsByEventIdAsync, getApplicationMetaByIdAsync } = useApplication()
  const { getEventByIdAsync } = useEvent()

  const [event, setEvent] = useState<SockbaseEvent>()
  const [apps, setApps] = useState<Record<string, SockbaseApplicationDocument>>()
  const [metas, setMetas] = useState<Record<string, SockbaseApplicationMeta>>()

  const onChangeEventId: () => void =
    () => {
      const fetchAppsAsync: () => Promise<void> =
        async () => {
          if (!eventId) return
          const fetchedEvent = await getEventByIdAsync(eventId)
          setEvent(fetchedEvent)

          const fetchedApps = await getApplicationsByEventIdAsync(eventId)
          setApps(fetchedApps)
          const appIds = Object.keys(fetchedApps)
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
        }
      fetchAppsAsync()
        .catch(err => {
          throw err
        })
    }
  useEffect(onChangeEventId, [eventId])

  const title = useMemo(() => {
    if (!event) return '申し込み一覧を読み込み中'
    return `${event.eventName} 申し込み一覧`
  }, [event])

  return (
    <>
      <DashboardLayout title={title}>
        {event && apps && metas
          ? <EventApplications event={event} apps={apps} metas={metas} />
          : <Loading text="申し込み一覧" />}
      </DashboardLayout>
    </>
  )
}

export default EventApplicationsContainer
