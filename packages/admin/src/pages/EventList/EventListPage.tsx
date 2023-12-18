import { MdEditCalendar } from 'react-icons/md'
import MainLayout from '../../components/Layouts/MainLayout/MainLayout'

const EventListPage: React.FC = () => {
  return (
    <MainLayout
      title="イベント管理"
      subTitle="Sockbase で管理しているイベントを表示します。"
      icon={<MdEditCalendar />}
    >
      EventListPage
    </MainLayout>
  )
}

export default EventListPage
