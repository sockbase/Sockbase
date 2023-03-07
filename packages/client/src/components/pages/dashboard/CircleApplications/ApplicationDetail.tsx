import type { SockbaseAccount, SockbaseApplicationDocument, SockbaseEvent } from 'sockbase'

import AdminDetail from './Detail/Admin'
import UserDetail from './Detail/User'

import { useMemo } from 'react'

const isAdmin = true

interface Props {
  app: SockbaseApplicationDocument
  event: SockbaseEvent
  userData: SockbaseAccount
}
const ApplicationDetail: React.FC<Props> = (props) => {
  const spaceName = useMemo(() => {
    const spaceData = props.event.spaces.filter(i => i.id === props.app.spaceId)[0]
    return spaceData.name
  }, [])

  return (
    <>
      {isAdmin
        ? <AdminDetail spaceName={spaceName} app={props.app} event={props.event} userData={props.userData} />
        : <UserDetail spaceName={spaceName} app={props.app} event={props.event} userData={props.userData} />
      }
    </>
  )
}

export default ApplicationDetail
