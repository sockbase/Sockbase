import { MdHome } from 'react-icons/md'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const App: React.FC = () => {
  return (
    <DefaultLayout>
      <Breadcrumbs>
        <li>ホーム</li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdHome />}
        title="ホーム"
        description="ホーム" />
    </DefaultLayout>
  )
}

export default App
