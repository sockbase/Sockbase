import { Link } from 'react-router-dom'
import { MdEditCalendar } from 'react-icons/md'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import EventList from './EventList'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'

const DashboardEventListPage: React.FC = () => {
  return (
    <DashboardBaseLayout title="管理イベント一覧">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEditCalendar />}
        title="管理イベント"
        description="管理中のイベント一覧" />

      <EventList />
    </DashboardBaseLayout>
  )
}

export default DashboardEventListPage
