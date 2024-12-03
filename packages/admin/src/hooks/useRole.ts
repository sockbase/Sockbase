import { useCallback, useMemo } from 'react'
import sockbaseShared from 'shared'

import useFirebase from './useFirebase'
import type { SockbaseRole } from 'sockbase'

const systemManagerOrganizationId =
  sockbaseShared.constants.organization.systemOrganizationId

interface IUseRole {
  checkIsAdminByOrganizationId: (organizationId: string) => boolean | null | undefined
  isAdminByAnyOrganization: boolean | null | undefined
  isSystemAdmin: boolean | null | undefined
  commonRole: SockbaseRole | null | undefined
  systemRole: SockbaseRole | null | undefined
}

const useRole = (): IUseRole => {
  const { roles } = useFirebase()

  const checkIsAdminByOrganizationId =
    useCallback((organizationId: string): boolean | null | undefined => {
      if (roles === undefined) return undefined
      if (roles === null) return null

      const systemRole = Object.entries(roles)
        .filter(([o]) => o === systemManagerOrganizationId)
        .map(([_, r]) => r)[0]
      if (systemRole === sockbaseShared.enumerations.user.permissionRoles.admin) {
        return true
      }

      const organizationRole = Object.entries(roles)
        .filter(([o]) => o === organizationId)
        .map(([_, r]) => r)[0]
      if (organizationRole === sockbaseShared.enumerations.user.permissionRoles.admin) {
        return true
      }

      return false
    }, [roles])

  const isAdminByAnyOrganization =
    useMemo(() => {
      if (roles === undefined) return undefined
      if (roles === null) return null

      return Object.values(roles)
        .filter(r => r === sockbaseShared.enumerations.user.permissionRoles.admin)
        .length > 0
    }, [roles])

  const isSystemAdmin =
    useMemo(() => {
      if (roles === undefined) return undefined
      if (roles === null) return null
      return roles.system >= 2
    }, [roles])

  const commonRole =
    useMemo(() => {
      if (roles === undefined) return undefined
      if (roles === null) {
        return sockbaseShared.enumerations.user.permissionRoles.user
      }

      const maxRole = Math.max(...Object.values(roles))
      return maxRole as SockbaseRole
    }, [roles])

  const systemRole =
    useMemo(() => {
      if (roles === undefined) return undefined
      if (roles === null) {
        return sockbaseShared.enumerations.user.permissionRoles.user
      }

      const role =
        roles.system !== undefined
          ? (roles.system as SockbaseRole)
          : sockbaseShared.enumerations.user.permissionRoles.user
      return role
    }, [roles])

  return {
    checkIsAdminByOrganizationId,
    isAdminByAnyOrganization,
    isSystemAdmin,
    commonRole,
    systemRole
  }
}

export default useRole
