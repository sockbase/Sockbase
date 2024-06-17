import { MdEditCalendar } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import StepContainer from './StepContainer/StepContainer'

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

      <StepContainer />
    </DashboardBaseLayout>
  )
}

export default DashboardEventCreatePage
