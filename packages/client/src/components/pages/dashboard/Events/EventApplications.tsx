import { Link } from 'react-router-dom'
import type { SockbaseApplicationDocument, SockbaseApplicationMeta, SockbaseEvent } from 'sockbase'
import sockbaseShared from '@sockbase/shared'

import { MdEditCalendar } from 'react-icons/md'
import PageTitle from '../../../Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../../Parts/Breadcrumbs'
// import Label from '../../../Parts/Label'

interface Props {
  event: SockbaseEvent
  apps: Record<string, SockbaseApplicationDocument>
  metas: Record<string, SockbaseApplicationMeta>
}
const EventApplications: React.FC<Props> = (props) => {
  return (
    <>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/events">管理イベント</Link></li>
        <li>{props.event._organization.name}</li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEditCalendar />}
        title={props.event.eventName}
        description="申し込みサークル一覧" />

      <table>
        <thead>
          <tr>
            <th>サークル名</th>
            <th>ペンネーム</th>
            <th>ステータス</th>
            <th>申し込み日時</th>
            <th>申し込みID</th>
          </tr>
        </thead>
        <tbody>
          {
            Object.entries(props.apps)
              .filter(([_, app]) => !!app.hashId)
              .map(([appId, app]) => (
                app.hashId && <tr key={app.hashId}>
                  <th><Link to={`/dashboard/applications/${app.hashId}`}>{app.circle.name}</Link></th>
                  <td>{app.circle.penName}</td>
                  <td>{sockbaseShared.constants.application.statusText[props.metas[appId].applicationStatus]}</td>
                  {/* <td> TODO: 申し込み関連ステータスのラベル コンポーネント化する <Label color="success">申し込み完了</Label></td> */}
                  <td>{new Date(app.timestamp).toLocaleString()}</td>
                  <td>{app.hashId}</td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </>
  )
}

export default EventApplications
