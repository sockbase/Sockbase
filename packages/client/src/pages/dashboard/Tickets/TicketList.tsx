import { MdWallet } from "react-icons/md"
import DashboardLayout from "../../../components/Layout/Dashboard/Dashboard"
import PageTitle from "../../../components/Layout/Dashboard/PageTitle"
import Breadcrumbs from "../../../components/Parts/Breadcrumbs"
import { Link } from "react-router-dom"

const TicketList: React.FC = () => {
  return (
    <DashboardLayout title="購入済みチケット一覧">
      <Breadcrumbs>
        <li><Link to="/dashboard/">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle title="購入済みチケット一覧" icon={<MdWallet />} description="あなたが購入したチケットを表示中" />

      <table>
        <thead>
          <tr>
            <th>チケットストア</th>
            <th>参加種別</th>
            <th>申し込み状況</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={3}>チケットはありません</td>
          </tr>
        </tbody>
      </table>
    </DashboardLayout>
  )
}

export default TicketList
