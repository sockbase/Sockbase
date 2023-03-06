import { Link } from 'react-router-dom'
import type { SockbaseApplicationDocument, SockbaseEvent } from 'sockbase'

import { MdEditCalendar } from 'react-icons/md'
import PageTitle from '../../../Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../../Parts/Breadcrumbs'

interface Props {
  event: SockbaseEvent
  apps: SockbaseApplicationDocument[]
}
const EventApplications: React.FC<Props> = (props) => {
  return (
    <>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/events">管理イベント</Link></li>
        <li>{props.event.organization.name}</li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEditCalendar />}
        title={props.event.eventName}
        description="申し込みサークル一覧" />

      <ul>
        {
          props.apps
            .filter(app => !!app.hashId)
            .map(app => (
              app.hashId && <li key={app.hashId}>
                <Link to={`/dashboard/applications/${app.hashId}`}>{app.circle.name}</Link>
              </li>
            ))
        }
      </ul>
    </>
  )
}

export default EventApplications
