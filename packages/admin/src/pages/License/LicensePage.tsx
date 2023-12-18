import { MdBadge } from 'react-icons/md'
import MainLayout from '../../components/Layouts/MainLayout/MainLayout'

const LicensePage: React.FC = () => {
  return (
    <MainLayout
      title="権限"
      subTitle="付与されている権限情報を表示します。"
      icon={<MdBadge />}
    >
      LicensePage
    </MainLayout>
  )
}

export default LicensePage
