import { MdBadge } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const LicensePage: React.FC = () => {
  return (
    <DefaultLayout title='権限'>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdBadge />}
        title="権限" />
    </DefaultLayout>
  )
}

export default LicensePage
