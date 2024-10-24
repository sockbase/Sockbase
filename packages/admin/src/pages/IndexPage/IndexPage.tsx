import { MdHome } from 'react-icons/md'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const IndexPage: React.FC = () => {
  return (
    <DefaultLayout title='ホーム'>
      <Breadcrumbs>
        <li>ホーム</li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdHome />}
        title="ホーム" />
      App
    </DefaultLayout>
  )
}

export default IndexPage
