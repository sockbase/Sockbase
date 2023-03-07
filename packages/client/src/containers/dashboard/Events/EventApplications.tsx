import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { SockbaseApplicationDocument, SockbaseEvent } from 'sockbase'

import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import EventApplications from '../../../components/pages/dashboard/Events/EventApplications'

import useApplication from '../../../hooks/useApplication'
import useEvent from '../../../hooks/useEvent'
import Loading from '../../../components/Parts/Loading'

const EventApplicationsContainer: React.FC = () => {
  const { eventId } = useParams()
  const { getApplicationsByEventIdAsync } = useApplication()
  const { getEventByIdAsync } = useEvent()

  const [event, setEvent] = useState<SockbaseEvent>()
  const [apps, setApps] = useState<SockbaseApplicationDocument[]>()

  const onChangeEventId: () => void =
    () => {
      const fetchAppsAsync: () => Promise<void> =
        async () => {
          if (!eventId) return
          const fetchedEvent = await getEventByIdAsync(eventId)
          const fetchedApps = await getApplicationsByEventIdAsync(eventId)
          setEvent(fetchedEvent)
          setApps(fetchedApps)
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
        {event && apps
          ? <EventApplications event={event} apps={apps} />
          : <Loading text="申し込み一覧" />}
      </DashboardLayout>
    </>
  )
}

export default EventApplicationsContainer
