import { useCallback } from 'react'
import SockbaseShared from '@sockbase/shared'

import useFirebase from './useFirebase'

const systemManagerOrganizationId = SockbaseShared.constants.organization.systemOrganizationId

const PermissionRoles = {
  User: 0,
  Staff: 1,
  Admin: 2
} as const

interface IUsePermission {
  checkIsAdmin: (organizationId: string) => boolean | undefined
}
const usePermission: () => IUsePermission =
  () => {
    const { claims } = useFirebase()

    const checkIsAdmin: (organizationId: string) => boolean | undefined =
      useCallback((organizationId) => {
        if (!claims) return

        const permissions = claims.permissions

        const systemPermission = Object.entries(permissions)
          .filter(([o]) => o === systemManagerOrganizationId)
          .map(([_, r]) => (r))
        if (systemPermission && systemPermission[0] === PermissionRoles.Admin) {
          return true
        }

        const organizationPermission = Object.entries(permissions)
          .filter(([o]) => o === organizationId)
          .map(([_, r]) => (r))
        if (organizationPermission && organizationPermission[0] === PermissionRoles.Admin) {
          return true
        }

        return false
      }, [claims])

    return {
      checkIsAdmin
    }
  }

export default usePermission
