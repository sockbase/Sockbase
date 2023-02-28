import DashboardLayout from '../components/Layout/Dashboard/Dashboard'
import DashboardTemplateComponent from '../components/pages/DashboardTemplate/DashboardTemplate'

const DashboardTemplate: React.FC = () => {
  return (
    <DashboardLayout title="ダッシュボード">
      <DashboardTemplateComponent />
    </DashboardLayout>
  )
}

export default DashboardTemplate
