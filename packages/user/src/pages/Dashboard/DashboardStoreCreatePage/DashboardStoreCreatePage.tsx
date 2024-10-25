import { MdStore } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import StepContainer from './StepContainer/StepContainer'

const DashboardStoreCreatePage: React.FC = () => {
  return (
    <DashboardBaseLayout title="チケットストア作成">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li>管理チケットストア</li>
      </Breadcrumbs>

      <PageTitle
        title='チケットストア作成'
        description='チケットストアを作成します'
        icon={<MdStore />} />

      <StepContainer />
    </DashboardBaseLayout>
  )
}

export default DashboardStoreCreatePage
