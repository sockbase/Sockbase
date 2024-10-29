import { MdStore } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import StepContainer from './StepContainer/StepContainer'

const StoreCreatePage: React.FC = () => {
  return (
    <DefaultLayout title="チケットストア作成">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/events">チケットストア一覧</Link></li>
      </Breadcrumbs>

      <PageTitle
        title="チケットストア作成"
        icon={<MdStore />} />

      <StepContainer />
    </DefaultLayout>
  )
}

export default StoreCreatePage
