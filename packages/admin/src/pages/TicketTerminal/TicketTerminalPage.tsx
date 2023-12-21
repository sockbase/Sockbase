import { MdQrCodeScanner } from 'react-icons/md'
import MainLayout from '../../components/Layouts/MainLayout/MainLayout'

const TicketTerminalPage: React.FC = () => {
  return (
    <MainLayout
      title="チケット照会ターミナル"
      subTitle="チケットコードを用いて情報を表示し、使用ステータスを管理します。"
      icon={<MdQrCodeScanner />}
      prevPage={{ path: '/', name: 'トップ' }}
    >
      TicketTerminalPage
    </MainLayout>
  )
}

export default TicketTerminalPage
