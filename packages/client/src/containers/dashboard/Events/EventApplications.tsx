import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import EventApplications from '../../../components/pages/dashboard/Events/EventApplications'

const EventApplicationsContainer: React.FC = () => {
  return (
    <DashboardLayout title="第二回しおばな祭 申し込み一覧">
      <EventApplications />
    </DashboardLayout>
  )
}

export default EventApplicationsContainer
