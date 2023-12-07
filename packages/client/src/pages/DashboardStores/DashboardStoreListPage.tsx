import { MdTableChart } from 'react-icons/md'
import { Link } from 'react-router-dom'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'

const DashboardStoreListPage: React.FC = () => {
  return (
    <DashboardBaseLayout title="チケットストア一覧" requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle title="管理チケットストア" icon={<MdTableChart />} description="管理中のチケットストア一覧" />

      <ul>
        <li>ねくたりしょん
          <ul>
            <li><Link to="/dashboard/stores/sockbase1-ticket">Hello Sockbase 入場チケット</Link></li>
          </ul>
        </li>
      </ul>
    </DashboardBaseLayout>
  )
}

export default DashboardStoreListPage
