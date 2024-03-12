import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { IconMChair } from 'react-fluentui-emoji/lib/modern'
import {
  type SockbaseApplicationDocument,
  type SockbaseEvent,
  type SockbaseSpaceDocument
} from 'sockbase'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import EventSpacesStepContainer from './StepContainer'

const DashboardEventSpacesPage: React.FC = () => {
  const { eventId } = useParams()
  const { getEventByIdAsync, getSpacesByEventIdAsync } = useEvent()
  const { getApplicationsByEventIdAsync } = useApplication()

  const [event, setEvent] = useState<SockbaseEvent>()
  const [spaces, setSpaces] = useState<SockbaseSpaceDocument[]>()
  const [apps, setApps] = useState<Record<string, SockbaseApplicationDocument>>()

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!eventId) return

      getEventByIdAsync(eventId)
        .then(fetchedEvent => setEvent(fetchedEvent))
        .catch(err => { throw err })

      getSpacesByEventIdAsync(eventId)
        .then(fetchedSpaces => setSpaces(fetchedSpaces))
        .catch(err => { throw err })

      getApplicationsByEventIdAsync(eventId)
        .then(fetchedApps => setApps(fetchedApps))
        .catch(err => { throw err })
    }
    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [eventId])

  const pageTitle = useMemo(() => {
    if (!event) return ''
    return `${event.eventName} スペース配置`
  }, [event])

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
        description="スペース配置"
        icon={<IconMChair />}
        isLoading={!event} />

      {eventId && spaces && apps && <EventSpacesStepContainer
        eventId={eventId}
        spaces={spaces}
        apps={apps} />}
    </DashboardBaseLayout>
  )
}

export default DashboardEventSpacesPage
