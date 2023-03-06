import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import ApplicationList from '../../../components/pages/dashboard/CircleApplications/ApplicationList'

const ApplicationListContainer: React.FC = () => {
  return (
    <DashboardLayout title="申し込んだイベント">
      <ApplicationList />
    </DashboardLayout>
  )
}

export default ApplicationListContainer
