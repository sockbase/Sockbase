import { useEffect, useState } from 'react'
import { type SockbaseEventDocument } from 'sockbase'
import { MdEditCalendar } from 'react-icons/md'
import useEvent from '../../hooks/useEvent'
import MainLayout from '../../components/Layouts/MainLayout/MainLayout'
import useDayjs from '../../hooks/useDayjs'
import LinkButton from '../../components/Parts/LinkButton'

const EventListPage: React.FC = () => {
  const { getEvents } = useEvent()
  const { formatByDate } = useDayjs()
  const [events, setEvents] = useState<SockbaseEventDocument[]>()

  const onInitialize = (): void => {
    const fetchEvents = async (): Promise<void> => {
      getEvents()
        .then(fetchedEvents => setEvents(fetchedEvents))
        .catch(err => { throw err })
    }
    fetchEvents()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [])

  return (
    <MainLayout
      title="イベント管理"
      subTitle="Sockbase で管理しているイベントを表示します。"
      icon={<MdEditCalendar />}
    >
      <table>
        <thead>
          <tr>
            <td>イベント名</td>
            <td>開催日</td>
            <td>募集期間</td>
            <td>運営組織</td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          {events?.sort((a, b) => b.schedules.startEvent - a.schedules.startEvent).map(e => <tr key={e.id}>
            <th>{e.eventName} {e.id}</th>
            <td>{formatByDate(e.schedules.startEvent, 'YYYY年M月D日')}</td>
            <td>
              {formatByDate(e.schedules.startApplication, 'YYYY年M月D日 ～ ')}
              {formatByDate(e.schedules.endApplication, 'M月D日')}
            </td>
            <td>{e._organization.name}</td>
            <td><LinkButton to={`/events/${e.id}`}>開く</LinkButton></td>
          </tr>)}
        </tbody>
      </table>
    </MainLayout>
  )
}

export default EventListPage
