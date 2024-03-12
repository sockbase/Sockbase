import { Link } from 'react-router-dom'
import { IconMEMail } from 'react-fluentui-emoji/lib/modern'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import Contact from './Contact'

const DashboardContactPage: React.FC = () => {
  return (
    <DashboardBaseLayout title="お問い合わせ" requireSystemRole={0}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<IconMEMail />}
        title="お問い合わせ"
        description="Sockbase運営チームへのお問い合わせはこちらから" />

      <Contact />
    </DashboardBaseLayout>
  )
}

export default DashboardContactPage
