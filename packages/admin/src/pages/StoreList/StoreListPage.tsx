import { MdStore } from 'react-icons/md'
import MainLayout from '../../components/Layouts/MainLayout/MainLayout'

const StoreListPage: React.FC = () => {
  return (
    <MainLayout
      title="チケットストア管理"
      subTitle="Sockbase で管理しているチケットストアを表示します。"
      icon={<MdStore />}
      prevPage={{ path: '/', name: 'トップ' }}
    >
      StoreListPage
    </MainLayout>
  )
}

export default StoreListPage
