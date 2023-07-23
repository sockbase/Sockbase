import { Link } from 'react-router-dom'
import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import DashboardEventList from '../../../components/pages/dashboard/Events/EventList'
import PageTitle from '../../../components/Layout/Dashboard/PageTitle'
import { MdTableChart } from 'react-icons/md'

const DashboardEventListContainer: React.FC = () => {
  return (
    <DashboardLayout title="管理イベント一覧">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdTableChart />}
        title="管理イベント"
        description="管理中のイベント一覧" />

      <DashboardEventList />
    </DashboardLayout>
  )
}

export default DashboardEventListContainer
