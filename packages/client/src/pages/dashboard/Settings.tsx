import DashboardLayout from '../../components/Layout/Dashboard/Dashboard'
import DashboardSettings from '../../components/pages/dashboard/Settings'

const DashboardContainer: React.FC = () => {
  return (
    <DashboardLayout title="マイページ設定">
      <DashboardSettings />
    </DashboardLayout>
  )
}

export default DashboardContainer
