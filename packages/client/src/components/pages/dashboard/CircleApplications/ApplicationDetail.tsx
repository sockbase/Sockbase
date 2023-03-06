import { Link } from 'react-router-dom'

import type { SockbaseAccount, SockbaseApplicationDocument, SockbaseEvent } from 'sockbase'

import { MdEdit } from 'react-icons/md'
import PageTitle from '../../../Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../../Parts/Breadcrumbs'

import AdminDetail from './Detail/Admin'
import UserDetail from './Detail/User'

import { useMemo } from 'react'

const isAdmin = false

interface Props {
  app: SockbaseApplicationDocument
  event: SockbaseEvent
  user: SockbaseAccount
}
const ApplicationDetail: React.FC<Props> = (props) => {
  const spaceName = useMemo(() => {
    const spaceData = props.event.spaces.filter(i => i.id === props.app.spaceId)[0]
    return spaceData.name
  }, [])

  return (
    <>
      <Breadcrumbs>
        <li><Link to="/dashboard">ダッシュボード</Link></li>
        <li><Link to="/dashboard/applications">サークル参加申し込み履歴</Link></li>
        {isAdmin && <li><Link to="/dashboard/events/sockbase1">{props.event.eventName}</Link></li>}
      </Breadcrumbs>
      <PageTitle
        icon={<MdEdit />}
        title={props.app.circle.name}
        description="申し込み情報" />

      {isAdmin
        ? <AdminDetail spaceName={spaceName} app={props.app} event={props.event} user={props.user} />
        : <UserDetail spaceName={spaceName} app={props.app} event={props.event} user={props.user} />
      }

    </>
  )
}

export default ApplicationDetail
