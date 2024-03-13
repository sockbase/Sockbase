import { MdEditCalendar } from 'react-icons/md'
import { Link } from 'react-router-dom'
import DashboardBaseLayout from '../../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../components/Layout/DashboardBaseLayout/PageTitle'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import EventCreateStepContainer from './StepContainer/StepContainer'

const DashboardEventCreatePage: React.FC = () => {
  return (
    <DashboardBaseLayout title="イベント作成" requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/events">管理イベント</Link></li>
      </Breadcrumbs>

      <PageTitle
        title="イベント作成"
        description="イベントを作成します"
        icon={<MdEditCalendar />} />

      <EventCreateStepContainer />
    </DashboardBaseLayout>
  )
}

export default DashboardEventCreatePage
