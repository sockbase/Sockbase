import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import DashboardEventList from '../../../components/pages/dashboard/Events/EventList'

const DashboardEventListContainer: React.FC = () => {
  return (
    <DashboardLayout title="管理イベント一覧">
      <DashboardEventList />
    </DashboardLayout>
  )
}

export default DashboardEventListContainer
