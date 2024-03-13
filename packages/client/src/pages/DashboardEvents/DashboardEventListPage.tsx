import { MdEditCalendar } from 'react-icons/md'
import { Link } from 'react-router-dom'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import EventList from './EventList'

const DashboardEventListPage: React.FC = () => {
  return (
    <DashboardBaseLayout title="管理イベント一覧" requireCommonRole={2}>
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
