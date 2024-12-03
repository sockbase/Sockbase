import { MdMail } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import Contact from './Contact'

const DashboardContactPage: React.FC = () => {
  return (
    <DashboardBaseLayout title="お問い合わせ">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle
        description="Sockbase 運営チームへのお問い合わせはこちらから"
        icon={<MdMail />}
        title="お問い合わせ" />

      <Contact />
    </DashboardBaseLayout>
  )
}

export default DashboardContactPage
