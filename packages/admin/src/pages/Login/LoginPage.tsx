import { MdLogin } from 'react-icons/md'
import MainLayout from '../../components/Layouts/MainLayout/MainLayout'

const LoginPage: React.FC = () => {
  return (
    <MainLayout
      title="ログイン"
      subTitle="Sockbase アカウントでログイン"
      icon={<MdLogin />}
    >
      ログイン
    </MainLayout>
  )
}

export default LoginPage
