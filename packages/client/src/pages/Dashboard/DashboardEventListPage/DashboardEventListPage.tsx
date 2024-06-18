import { MdEditCalendar } from 'react-icons/md'
import { Link } from 'react-router-dom'
import EventList from '../../../components/Events/EventList'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import LinkButton from '../../../components/Parts/LinkButton'
import useRole from '../../../hooks/useRole'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'

const DashboardEventListPage: React.FC = () => {
  const { isSystemAdmin } = useRole()

  return (
    <DashboardBaseLayout title="管理イベント一覧" requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdEditCalendar />}
        title="管理イベント"
        description="管理中のイベント一覧" />

      {isSystemAdmin && <FormSection>
        <FormItem inlined>
          <LinkButton to="/dashboard/events/create" inlined>イベント作成</LinkButton>
        </FormItem>
      </FormSection>}

      <EventList />
    </DashboardBaseLayout>
  )
}

export default DashboardEventListPage
