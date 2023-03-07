import { Link } from 'react-router-dom'
import type { SockbaseApplicationDocument, SockbaseEvent } from 'sockbase'

import { MdEditNote } from 'react-icons/md'
import PageTitle from '../../../Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../../Parts/Breadcrumbs'

interface Props {
  apps: SockbaseApplicationDocument[]
  events: Record<string, SockbaseEvent>
}
const ApplicationList: React.FC<Props> = (props) => {
  return (
    <>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEditNote />}
        title="サークル申し込み履歴"
        description="今までに申し込んだイベントの一覧を表示中" />

      <table>
        <thead>
          <tr>
            <th>イベント名</th>
            <th>ステータス</th>
            <th>サークル名</th>
            <th>ペンネーム</th>
            <th>申し込み日時</th>
          </tr>
        </thead>
        <tbody>
          {
            props.apps
              .filter(app => !!app.hashId)
              .map(app => (
                app.hashId && <tr key={app.hashId}>
                  <th><Link to={`/dashboard/applications/${app.hashId}`}>{props.events[app.eventId].eventName}</Link></th>
                  <td>申し込み完了</td>
                  <td>{app.circle.name}</td>
                  <td>{app.circle.penName}</td>
                  <td>{new Date(app.timestamp).toLocaleString()}</td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </>
  )
}

export default ApplicationList
