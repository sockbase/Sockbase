import { Link } from 'react-router-dom'
import { MdEditCalendar } from 'react-icons/md'
import DashboardLayout from '../../components/Layout/Dashboard/Dashboard'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import EventList from './EventList'
import PageTitle from '../../components/Layout/Dashboard/PageTitle'

const DashboardEventListPage: React.FC = () => {
  return (
    <DashboardLayout title="管理イベント一覧">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEditCalendar />}
        title="管理イベント"
        description="管理中のイベント一覧" />

      <EventList />
    </DashboardLayout>
  )
}

export default DashboardEventListPage
