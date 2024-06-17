import { MdMail } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import DashboardBaseLayout from '../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../layouts/DashboardBaseLayout/PageTitle'
import Contact from './Contact'

const DashboardContactPage: React.FC = () => {
  return (
    <DashboardBaseLayout title="お問い合わせ" requireSystemRole={0}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle icon={<MdMail />} title="お問い合わせ" description="Sockbase運営チームへのお問い合わせはこちらから" />

      <Contact />
    </DashboardBaseLayout>
  )
}

export default DashboardContactPage
