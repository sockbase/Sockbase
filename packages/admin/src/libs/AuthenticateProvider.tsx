import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { User } from 'firebase/auth'
import type { SockbaseRole } from 'sockbase'

interface Props {
  user?: User | null | undefined
  commonRole?: SockbaseRole | null | undefined
  systemRole?: SockbaseRole | null | undefined
  allowAnonymous?: boolean
  requireSystemRole?: SockbaseRole
  requireCommonRole?: SockbaseRole
  children: React.ReactNode
}
const AuthenticateProvider: React.FC<Props> = props => {
  const location = useLocation()
  const navigate = useNavigate()

  const isLoginPath = useMemo(() => location.pathname.startsWith('/login'), [location])

  const showChildren = useMemo(() => {
    if (props.user === undefined) {
      return undefined
    }
    else if (props.commonRole === undefined || props.systemRole === undefined) {
      return undefined
    }
    else if (props.requireSystemRole) {
      return props.systemRole !== null && props.requireSystemRole <= props.systemRole
    }
    else if (props.requireCommonRole) {
      return props.commonRole !== null && props.requireCommonRole <= props.commonRole
    }
    else if (!isLoginPath && props.allowAnonymous) {
      return true
    }
    else if (isLoginPath && props.user === null) {
      return true
    }
    else if (!isLoginPath && props.user) {
      return true
    }
    else if (props.user === null) {
      return false
    }
    return false
  }, [
    props.user,
    props.systemRole,
    props.commonRole,
    props.allowAnonymous,
    props.requireCommonRole,
    props.requireSystemRole,
    isLoginPath])

  useEffect(() => {
    if (props.user === undefined) return
    if (isLoginPath && props.user) {
      navigate('/')
      return
    }

    if (showChildren === undefined) return
    if (showChildren) return
    navigate('/login')
  }, [props.user, isLoginPath, showChildren])

  return (
    <>
      {showChildren && props.children}
    </>
  )
}

export default AuthenticateProvider
