import { MdTableChart } from 'react-icons/md'
import PageTitle from '../../../Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../../Parts/Breadcrumbs'
import { Link } from 'react-router-dom'

const EventList: React.FC = () => {
  return (
    <>
      <Breadcrumbs>
        <li><Link to="/dashboard">ダッシュボード</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdTableChart />}
        title="管理イベント"
        description="管理中のイベント一覧" />

      <ul>
        <li>ねくたりしょん
          <ul>
            <li><Link to="/dashboard/events/sockbase1">Hello Sockbase!</Link></li>
          </ul>
        </li>
        <li>TeamKitten
          <ul>
            <li><Link to="/dashboard/events/sockbase1">Hello Sockbase!</Link></li>
          </ul>
        </li>
        <li>N-Point
          <ul>
            <li><Link to="/dashboard/events/sockbase1">Hello Sockbase!</Link></li>
          </ul>
        </li>
      </ul>
    </>
  )
}

export default EventList
