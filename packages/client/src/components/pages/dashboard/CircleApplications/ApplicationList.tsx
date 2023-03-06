import type { SockbaseApplicationDocument } from 'sockbase'
import { Link } from 'react-router-dom'

import { MdEditNote } from 'react-icons/md'
import PageTitle from '../../../Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../../Parts/Breadcrumbs'

interface Props {
  apps: SockbaseApplicationDocument[]
}
const ApplicationList: React.FC<Props> = (props) => {
  return (
    <>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEditNote />}
        title="サークル申し込み履歴"
        description="今までに申し込んだイベントの一覧を表示中" />

      <ul>
        {
          props.apps
            .filter(app => !!app.hashId)
            .map(app => (
              app.hashId && <li key={app.hashId}>
                <Link to={`/dashboard/applications/${app.hashId}`}>{app.circle.name}</Link>
              </li>
            ))
        }
      </ul>
    </>
  )
}

export default ApplicationList
