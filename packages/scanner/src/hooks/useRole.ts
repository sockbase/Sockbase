import { useMemo } from 'react'
import sockbaseShared from 'shared'

import useFirebase from './useFirebase'
import type { SockbaseRole } from 'sockbase'

interface IUseRole {
  commonRole: SockbaseRole | null | undefined
}

const useRole = (): IUseRole => {
  const { roles } = useFirebase()

  const commonRole =
    useMemo(() => {
      if (roles === undefined) return undefined
      if (roles === null) {
        return sockbaseShared.enumerations.user.permissionRoles.user
      }

      const maxRole = Math.max(...Object.values(roles))
      return maxRole as SockbaseRole
    }, [roles])

  return {
    commonRole
  }
}

export default useRole
