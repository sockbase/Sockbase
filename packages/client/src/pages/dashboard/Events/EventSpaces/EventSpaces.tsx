import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { type SockbaseEvent, type SockbaseSpaceDocument } from 'sockbase'
import DashboardLayout from '../../../../components/Layout/Dashboard/Dashboard'
import Breadcrumbs from '../../../../components/Parts/Breadcrumbs'
import PageTitle from '../../../../components/Layout/Dashboard/PageTitle'
import { MdAssignmentTurnedIn } from 'react-icons/md'
import useEvent from '../../../../hooks/useEvent'
import BlinkField from '../../../../components/Parts/BlinkField'
import EventSpacesStepContainer from './StepContainer'

const EventSpaces: React.FC = () => {
  const { eventId } = useParams()
  const { getEventByIdAsync, getSpacesAsync } = useEvent()

  const [event, setEvent] = useState<SockbaseEvent>()
  const [spaces, setSpaces] = useState<SockbaseSpaceDocument[]>()

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!eventId) return

      getEventByIdAsync(eventId)
        .then(fetchedEvent => setEvent(fetchedEvent))
        .catch(err => { throw err })

      getSpacesAsync(eventId)
        .then(fetchedSpaces => setSpaces(fetchedSpaces))
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
    <DashboardLayout title={pageTitle}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/events">管理イベント</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/dashboard/events/${eventId}`}>{event?.eventName ?? <BlinkField />}</Link></li>
      </Breadcrumbs>
      <PageTitle title={event?.eventName} description="スペース配置" icon={<MdAssignmentTurnedIn />} isLoading={!event} />

      {eventId && spaces && <EventSpacesStepContainer eventId={eventId} spaces={spaces} />}
    </DashboardLayout>
  )
}

export default EventSpaces
