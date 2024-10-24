import { MdQrCodeScanner } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const TicketTerminalPage: React.FC = () => {
  return (
    <DefaultLayout title='チケット照会ターミナル'>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdQrCodeScanner />}
        title="チケット照会ターミナル" />
    </DefaultLayout>
  )
}

export default TicketTerminalPage
