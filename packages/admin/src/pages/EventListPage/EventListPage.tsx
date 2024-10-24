import { MdEditCalendar } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const EventListPage: React.FC = () => {
  return (
    <DefaultLayout title='イベント管理'>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEditCalendar />}
        title="イベント管理" />
    </DefaultLayout>
  )
}

export default EventListPage
