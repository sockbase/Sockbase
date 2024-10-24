import { MdInfo } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const InformationListPage: React.FC = () => {
  return (
    <DefaultLayout title='お知らせ管理' requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdInfo />}
        title="お知らせ管理" />
    </DefaultLayout>
  )
}

export default InformationListPage
