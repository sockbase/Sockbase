import { MdEditCalendar } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const StoreListPage: React.FC = () => {
  return (
    <DefaultLayout title='チケットストア管理' requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEditCalendar />}
        title="チケットストア管理" />
    </DefaultLayout>
  )
}

export default StoreListPage
