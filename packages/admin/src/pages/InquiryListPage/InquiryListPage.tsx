import { MdInbox } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const InquiryListPage: React.FC = () => {
  return (
    <DefaultLayout title='問い合わせ管理'>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdInbox />}
        title="問い合わせ管理" />
    </DefaultLayout>
  )
}

export default InquiryListPage
