import { Link } from 'react-router-dom'

import { MdEditNote } from 'react-icons/md'
import PageTitle from '../../../Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../../Parts/Breadcrumbs'

const ApplicationList: React.FC = () => {
  return (
    <>
      <Breadcrumbs>
        <li><Link to="/dashboard">ダッシュボード</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEditNote />}
        title="サークル申し込み履歴"
        description="今までに申し込んだイベントの一覧を表示中" />

      <ul>
        <li><Link to="/dashboard/applications/:applicationId">Hello Sockbase! as ねくたりしょん</Link></li>
      </ul>
    </>
  )
}

export default ApplicationList
