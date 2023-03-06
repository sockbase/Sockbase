import { Link } from 'react-router-dom'

import { MdEdit } from 'react-icons/md'
import PageTitle from '../../../Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../../Parts/Breadcrumbs'

const ApplicationDetail: React.FC = () => {
  return (
    <>
      <Breadcrumbs>
        <li><Link to="/dashboard">ダッシュボード</Link></li>
        <li><Link to="/dashboard/applications">サークル参加申し込み履歴</Link></li>
        {/* TODO ↓ 管理者の場合のみイベント名を表示する */}
        <li><Link to="/dashboard/events/sockbase1">Hello Sockbase!</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEdit />}
        title="ねくたりしょん"
        description="申し込み情報" />
    </>
  )
}

export default ApplicationDetail
