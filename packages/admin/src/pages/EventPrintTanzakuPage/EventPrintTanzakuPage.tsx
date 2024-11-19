import { useEffect, useState } from 'react'
import { MdPrint } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import { type SockbaseEventDocument } from 'sockbase'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import useEvent from '../../hooks/useEvent'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const EventPrintTanzakuPage: React.FC = () => {
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
    <DefaultLayout title="配置短冊印刷" requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/events">イベント一覧</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/events/${eventId}`}>{event?.name ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        title="配置短冊印刷"
        icon={<MdPrint />} />

        WIP
    </DefaultLayout>
  )
}

export default EventPrintTanzakuPage
