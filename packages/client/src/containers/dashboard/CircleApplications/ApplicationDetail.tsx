import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import ApplicationDetail from '../../../components/pages/dashboard/CircleApplications/ApplicationDetail'

const ApplicationDetailContainer: React.FC = () => {
  return (
    <DashboardLayout title="Hello Sockbase! 申し込み情報">
      <ApplicationDetail />
    </DashboardLayout>
  )
}

export default ApplicationDetailContainer
