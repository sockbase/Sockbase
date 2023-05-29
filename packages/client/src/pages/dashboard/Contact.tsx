import DashboardLayout from '../../components/Layout/Dashboard/Dashboard'
import Contact from '../../components/pages/dashboard/Contact'

const ContactContainer: React.FC = () => {
  return (
    <DashboardLayout title="お問い合わせ">
      <Contact />
    </DashboardLayout>
  )
}

export default ContactContainer
