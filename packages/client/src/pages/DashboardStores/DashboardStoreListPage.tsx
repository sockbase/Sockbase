import { MdTableChart } from 'react-icons/md'
import { Link } from 'react-router-dom'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import LinkButton from '../../components/Parts/LinkButton'
import useRole from '../../hooks/useRole'

const DashboardStoreListPage: React.FC = () => {
  const { isSystemAdmin } = useRole()

  return (
    <DashboardBaseLayout title="チケットストア一覧" requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>

      <PageTitle
        title="管理チケットストア"
        icon={<MdTableChart />}
        description="管理中のチケットストア一覧" />

      {isSystemAdmin && <FormSection>
        <FormItem inlined>
          <LinkButton to="/dashboard/stores/create" inlined>チケットストア作成</LinkButton>
        </FormItem>
      </FormSection>}

      <ul>
        <li>ねくたりしょん
          <ul>
            <li><Link to="/dashboard/stores/shiobana2-ticket">第二回しおばな祭 入場チケット</Link></li>
            <li><Link to="/dashboard/stores/ad1fts1-ticket">あだいちふたすて 入場チケット</Link></li>
          </ul>
        </li>
      </ul>
    </DashboardBaseLayout>
  )
}

export default DashboardStoreListPage
