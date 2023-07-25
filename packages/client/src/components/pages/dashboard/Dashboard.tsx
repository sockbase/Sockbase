import { MdHome } from 'react-icons/md'
import PageTitle from '../../Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../Parts/Breadcrumbs'

const Dashboard: React.FC = () => {
  return (
    <>
      <Breadcrumbs>
        <li>マイページ</li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdHome />}
        title="ホーム"
        description="Sockbaseマイページへようこそ！" />
      <p>
        行いたい操作をメニューから選んでください。
      </p>
    </>
  )
}

export default Dashboard
