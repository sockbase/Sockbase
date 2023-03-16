import { useCallback, useMemo } from 'react'
import sockbaseShared from '@sockbase/shared'

import useFirebase from './useFirebase'
import type { SockbaseRole } from 'sockbase'

const systemManagerOrganizationId = sockbaseShared.constants.organization.systemOrganizationId

interface IUseRole {
  checkIsAdminByOrganizationId: (organizationId: string) => boolean | null | undefined
  isAdminByAnyOrganization: boolean | null | undefined
  commonRole: SockbaseRole | null | undefined
}

const useRole: () => IUseRole =
  () => {
    const { roles } = useFirebase()

    const checkIsAdminByOrganizationId: (organizationId: string) => boolean | null | undefined =
      useCallback((organizationId) => {
        if (roles === undefined) return undefined
        if (roles === null) return null

        const systemRole = Object.entries(roles)
          .filter(([o]) => o === systemManagerOrganizationId)
          .map(([_, r]) => (r))
        if (systemRole && systemRole[0] === sockbaseShared.enumerations.user.permissionRoles.admin) {
          return true
        }

        const organizationRole = Object.entries(roles)
          .filter(([o]) => o === organizationId)
          .map(([_, r]) => (r))
        if (organizationRole && organizationRole[0] === sockbaseShared.enumerations.user.permissionRoles.admin) {
          return true
        }

        return false
      }, [roles])

    const isAdminByAnyOrganization: boolean | null | undefined =
      useMemo(() => {
        if (roles === undefined) return undefined
        if (roles === null) return null

        const isAnyAdmin = Object.values(roles)
          .filter(r => r === sockbaseShared.enumerations.user.permissionRoles.admin)
          .length > 0
        return isAnyAdmin
      }, [roles])

    const commonRole: SockbaseRole | null | undefined =
      useMemo(() => {
        if (roles === undefined) return undefined
        if (roles === null) return sockbaseShared.enumerations.user.permissionRoles.user

        const maxRole = Math.max(...Object.values(roles))
        return maxRole as SockbaseRole
      }, [roles])

    return {
      checkIsAdminByOrganizationId,
      isAdminByAnyOrganization,
      commonRole
    }
  }

export default useRole
