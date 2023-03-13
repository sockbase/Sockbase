import type { SockbaseAccount, SockbaseApplicationDocument, SockbaseEvent } from 'sockbase'

import AdminDetail from './Detail/Admin'
import UserDetail from './Detail/User'

import { useMemo } from 'react'

interface Props {
  app: SockbaseApplicationDocument
  event: SockbaseEvent
  userData: SockbaseAccount
  circleCutURL: string
  isAdmin: boolean
}
const ApplicationDetail: React.FC<Props> = (props) => {
  const spaceName = useMemo(() => {
    const spaceData = props.event.spaces.filter(i => i.id === props.app.spaceId)[0]
    return spaceData.name
  }, [])

  return (
    <>
      {props.isAdmin
        ? <AdminDetail spaceName={spaceName} app={props.app} event={props.event} userData={props.userData} circleCutURL={props.circleCutURL} />
        : <UserDetail spaceName={spaceName} app={props.app} event={props.event} userData={props.userData} circleCutURL={props.circleCutURL} />
      }
    </>
  )
}

export default ApplicationDetail
