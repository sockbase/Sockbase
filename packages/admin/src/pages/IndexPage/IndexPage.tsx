import { MdHome } from 'react-icons/md'
import Alert from '../../components/Parts/Alert'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import useRole from '../../hooks/useRole'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const IndexPage: React.FC = () => {
  const { commonRole } = useRole()
  return (
    <DefaultLayout title="ホーム">
      {commonRole === 0 && (
        <Alert
          title="アカウントが無効です"
          type="error" />
      )}
      {commonRole != null && commonRole >= 1 && (
        <>
          <Breadcrumbs>
            <li>ホーム</li>
          </Breadcrumbs>
          <PageTitle
            icon={<MdHome />}
            title="ホーム" />

            メニューから行いたい操作を選択してください。
        </>
      )}
    </DefaultLayout>
  )
}

export default IndexPage
