import { MdStore } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import StoreCreateStepContainer from './StepContainer/StepContainer'

const DashboardStoreCreatePage: React.FC = () => {
  return (
    <DashboardBaseLayout title="チケットストア作成" requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/stores">管理チケットストア</Link></li>
      </Breadcrumbs>

      <PageTitle
        title='チケットストア作成'
        description='チケットストアを作成します'
        icon={<MdStore />} />

      <StoreCreateStepContainer />
    </DashboardBaseLayout>
  )
}

export default DashboardStoreCreatePage
