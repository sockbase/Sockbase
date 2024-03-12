import { Link } from 'react-router-dom'
import ApplicationStatusLabel from '../../components/Parts/StatusLabel/ApplicationStatusLabel'
import type { SockbaseApplicationDocument, SockbaseApplicationMeta, SockbaseEvent } from 'sockbase'

interface Props {
  apps: Record<string, SockbaseApplicationDocument>
  metas: Record<string, SockbaseApplicationMeta>
  events: Record<string, SockbaseEvent>
}
const EventCircleApplicationList: React.FC<Props> = (props) => {
  return (
    <>
      <table>
        <thead>
          <tr>
            <th>イベント名</th>
            <th>サークル名</th>
            <th>ペンネーム</th>
            <th>申し込み状態</th>
            <th>申し込み日時</th>
          </tr>
        </thead>
        <tbody>
          {
            Object.entries(props.apps).length !== 0
              ? Object.entries(props.apps)
                .filter(([_, app]) => !!app.hashId)
                .sort(([_a, a], [_b, b]) => (b.createdAt?.getTime() ?? 9) - (a.createdAt?.getTime() ?? 0))
                .map(([appId, app]) => (
                  app.hashId && <tr key={app.hashId}>
                    <th><Link to={`/dashboard/applications/${app.hashId}`}>{props.events[app.eventId].eventName}</Link></th>
                    <td>{app.circle.name}</td>
                    <td>{app.circle.penName}</td>
                    <td><ApplicationStatusLabel status={props.metas[appId].applicationStatus} /></td>
                    <td>{app.createdAt?.toLocaleString() ?? '-'}</td>
                  </tr>
                ))
              : <tr><th colSpan={5}>申し込み情報はありません</th></tr>
          }
        </tbody>
      </table>
    </>
  )
}

export default EventCircleApplicationList
