import { MdStore } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import StepContainer from './StepContainer/StepContainer'

const StoreCreatePage: React.FC = () => {
  return (
    <DefaultLayout
      requireSystemRole={2}
      title="チケットストア作成">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/events">チケットストア一覧</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdStore />}
        title="チケットストア作成" />

      <StepContainer />
    </DefaultLayout>
  )
}

export default StoreCreatePage
