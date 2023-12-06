import { Link } from 'react-router-dom'
import { MdMail } from 'react-icons/md'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import Contact from './Contact'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'

const DashboardContactPage: React.FC = () => {
  return (
    <DashboardBaseLayout title="お問い合わせ">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle icon={<MdMail />} title="お問い合わせ" description="Sockbase運営チームへのお問い合わせはこちらから" />

      <Contact />
    </DashboardBaseLayout>
  )
}

export default DashboardContactPage
