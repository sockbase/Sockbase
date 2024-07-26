import { Link } from 'react-router-dom'
import ApplicationStatusLabel from '../../../components/Parts/StatusLabel/ApplicationStatusLabel'
import useDayjs from '../../../hooks/useDayjs'
import type { SockbaseApplicationDocument, SockbaseApplicationMeta, SockbaseEvent } from 'sockbase'

interface Props {
  apps: Record<string, SockbaseApplicationDocument>
  metas: Record<string, SockbaseApplicationMeta>
  events: Record<string, SockbaseEvent>
}
const CircleApplicationList: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()

  return (
    <>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>イベント名</th>
            <th>開催日</th>
            <th>会場</th>
          </tr>
        </thead>
        <tbody>
          {
            Object.entries(props.apps).length !== 0
              ? Object.entries(props.apps)
                .filter(([_, app]) => !!app.hashId)
                .sort(([, a], [, b]) => props.events[b.eventId].schedules.startEvent - props.events[a.eventId].schedules.startEvent)
                .map(([appId, app]) => (
                  app.hashId && <tr key={app.hashId}>
                    <td><ApplicationStatusLabel status={props.metas[appId].applicationStatus} /></td>
                    <td style={{ width: '40%' }}><Link to={`/dashboard/applications/${app.hashId}`}>{props.events[app.eventId].name}</Link></td>
                    <td>{formatByDate(props.events[app.eventId].schedules.startEvent, 'YYYY/MM/DD')}</td>
                    <td>{props.events[app.eventId].venue.name}</td>
                  </tr>
                ))
              : <tr><th colSpan={5}>申し込み情報はありません</th></tr>
          }
        </tbody>
      </table>
    </>
  )
}

export default CircleApplicationList
