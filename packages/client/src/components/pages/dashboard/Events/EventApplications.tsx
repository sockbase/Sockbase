import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { SockbaseApplicationDocument, SockbaseApplicationMeta, SockbaseEvent } from 'sockbase'
import sockbaseShared from 'shared'

import { MdEditCalendar } from 'react-icons/md'
import PageTitle from '../../../Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../../Parts/Breadcrumbs'
// import Label from '../../../Parts/Label'

interface Props {
  event: SockbaseEvent
  apps: Record<string, SockbaseApplicationDocument>
  metas: Record<string, SockbaseApplicationMeta>
}
const EventApplications: React.FC<Props> = (props) => {
  const circleCount = useMemo(() => {
    const appCount = Object.keys(props.apps)
      .filter(i => props.metas[i].applicationStatus !== 1)
      .length
    return appCount
  }, [props.apps])

  const spaceName: (spaceId: string) => string =
    (spaceId) => props.event.spaces
      .filter(s => s.id === spaceId)[0].name

  return (
    <>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/events">管理イベント</Link></li>
        <li>{props.event._organization.name}</li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEditCalendar />}
        title={props.event.eventName}
        description="申し込みサークル一覧" />

      <p>
        総申込みサークル数(キャンセル除く): {circleCount}件
      </p>

      <table>
        <thead>
          <tr>
            <th>サークル名</th>
            <th>ペンネーム</th>
            <th>申し込みスペース</th>
            <th>ステータス</th>
            <th>申し込み日時</th>
            <th>申し込みID</th>
          </tr>
        </thead>
        <tbody>
          {
            Object.entries(props.apps)
              .filter(([_, app]) => !!app.hashId)
              .map(([appId, app]) => (
                app.hashId && <tr key={app.hashId}>
                  <th><Link to={`/dashboard/applications/${app.hashId}`}>{app.circle.name}</Link></th>
                  <td>{app.circle.penName}</td>
                  <td>{spaceName(app.spaceId)}</td>
                  <td>{sockbaseShared.constants.application.statusText[props.metas[appId].applicationStatus]}</td>
                  {/* <td> // TODO: 申し込み関連ステータスのラベル コンポーネント化する <Label color="success">申し込み完了</Label></td> */}
                  <td>{app.createdAt?.toLocaleString() ?? '-'}</td>
                  <td>{app.hashId}</td>
                </tr>
              ))
          }
        </tbody>
      </table>
    </>
  )
}

export default EventApplications
