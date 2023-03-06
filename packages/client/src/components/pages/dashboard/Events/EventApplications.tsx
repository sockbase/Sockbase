import { Link } from 'react-router-dom'

import { MdEditCalendar } from 'react-icons/md'
import PageTitle from '../../../Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../../Parts/Breadcrumbs'

const EventApplications: React.FC = () => {
  return (
    <>
      <Breadcrumbs>
        <li><Link to="/dashboard">ダッシュボード</Link></li>
        <li><Link to="/dashboard/events">管理イベント</Link></li>
        <li>ねくたりしょん</li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEditCalendar />}
        title="Hello Sockbase!"
        description="申し込みサークル一覧" />

      <ul>
        <li><Link to="/dashboard/applications/:applicationId">ねくたりしょん</Link></li>
      </ul>
    </>
  )
}

export default EventApplications
