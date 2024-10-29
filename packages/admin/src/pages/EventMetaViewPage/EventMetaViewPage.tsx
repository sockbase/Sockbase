import { useState, useEffect } from 'react'
import { MdGridView } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import CopyToClipboard from '../../components/Parts/CopyToClipboard'
import EventInfo from '../../components/Parts/EventInfo'
import PageTitle from '../../components/Parts/PageTitle'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import useEvent from '../../hooks/useEvent'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseEvent } from 'sockbase'

const EventMetaViewPage: React.FC = () => {
  const { eventId } = useParams()
  const { getEventByIdAsync } = useEvent()

  const [event, setEvent] = useState<SockbaseEvent>()

  useEffect(() => {
    if (!eventId) return
    getEventByIdAsync(eventId)
      .then(setEvent)
      .catch(err => { throw err })
  }, [eventId])

  return (
    <DefaultLayout title="イベントメタ情報">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/events">イベント一覧</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/events/${eventId}`}>{event?.name ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdGridView />}
        title="イベントメタ情報" />

      <TwoColumnLayout>
        <>
          <h2>イベント情報</h2>

          <EventInfo
            eventId={eventId}
            event={event}
            eyecatchData={null} />
        </>
        <>
          <h2>管理</h2>
          <p>
            設定データをコピー <CopyToClipboard content={JSON.stringify(event)} />
          </p>
        </>
      </TwoColumnLayout>
    </DefaultLayout>
  )
}

export default EventMetaViewPage
