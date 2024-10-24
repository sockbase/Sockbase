import { useEffect, useState } from 'react'
import { MdCalendarToday } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import useEvent from '../../hooks/useEvent'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseEventDocument } from 'sockbase'

const EventViewPage: React.FC = () => {
  const { eventId } = useParams()

  const { getEventByIdAsync } = useEvent()

  const [event, setEvent] = useState<SockbaseEventDocument>()

  useEffect(() => {
    if (!eventId) return

    getEventByIdAsync(eventId)
      .then(setEvent)
      .catch(err => { throw err })
  }, [eventId])

  return (
    <DefaultLayout title={event?.name ?? 'イベント情報'} requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/events">イベント一覧</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdCalendarToday />}
        title={event?.name}
        isLoading={!event} />
    </DefaultLayout>
  )
}

export default EventViewPage
