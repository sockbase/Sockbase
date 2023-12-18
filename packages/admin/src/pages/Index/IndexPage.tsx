import { MdHome } from 'react-icons/md'
import MainLayout from '../../components/Layouts/MainLayout/MainLayout'

const IndexPage: React.FC = () => {
  return (
    <MainLayout
      title="Sockbase 管理パネル"
      subTitle="Sockbase 管理パネルへようこそ"
      icon={<MdHome />}
    >
      IndexPage
    </MainLayout>
  )
}

export default IndexPage
