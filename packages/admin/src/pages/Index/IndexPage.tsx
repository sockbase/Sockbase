import { MdHome } from 'react-icons/md'
import MainLayout from '../../components/Layouts/MainLayout/MainLayout'

const IndexPage = (): React.ReactNode => {
  return (
    <MainLayout
      title="Sockbase 管理パネル"
      subTitle="Sockbase 管理パネルへようこそ"
      icon={<MdHome />}
    >
      トップ
    </MainLayout>
  )
}

export default IndexPage
