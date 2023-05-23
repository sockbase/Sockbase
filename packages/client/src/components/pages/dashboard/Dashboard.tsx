import { MdHome } from 'react-icons/md'
import PageTitle from '../../Layout/Dashboard/PageTitle'

const Dashboard: React.FC = () => {
  return (
    <>
      <PageTitle
        icon={<MdHome />}
        title="マイページ ホーム"
        description="Sockbaseマイページへようこそ！" />
      <p>
        行いたい操作をメニューから選んでください。
      </p>
    </>
  )
}

export default Dashboard
