import { Link } from 'react-router-dom'
import { MdMail } from 'react-icons/md'
import DashboardLayout from '../../components/Layout/Dashboard/Dashboard'
import PageTitle from '../../components/Layout/Dashboard/PageTitle'
import Contact from '../../components/pages/dashboard/Contact'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'

const ContactContainer: React.FC = () => {
  return (
    <DashboardLayout title="お問い合わせ">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle icon={<MdMail />} title="お問い合わせ" description="Sockbase運営チームへのお問い合わせはこちらから" />

      <Contact />
    </DashboardLayout>
  )
}

export default ContactContainer
