import DashboardLayout from '../../components/Layout/Dashboard/Dashboard'
import Dashboard from '../../components/pages/dashboard/Dashboard'

const DashboardContainer: React.FC = () => {
  return (
    <DashboardLayout title="マイページ ホーム">
      <Dashboard />
    </DashboardLayout>
  )
}

export default DashboardContainer
