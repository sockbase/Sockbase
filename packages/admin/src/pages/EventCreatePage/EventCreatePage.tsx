import { MdEditCalendar } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import StepContainer from './StepContainer/StepContainer'

const EventCreatePage: React.FC = () => {
  return (
    <DefaultLayout title="イベント作成">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/events">イベント一覧</Link></li>
      </Breadcrumbs>

      <PageTitle
        title="イベント作成"
        icon={<MdEditCalendar />} />

      <StepContainer />
    </DefaultLayout>
  )
}

export default EventCreatePage
