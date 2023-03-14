import { useCallback } from 'react'
import SockbaseShared from '@sockbase/shared'

import useFirebase from './useFirebase'

const systemManagerOrganizationId = SockbaseShared.constants.organization.systemOrganizationId

const PermissionRoles = {
  User: 0,
  Staff: 1,
  Admin: 2
} as const

interface IUseRole {
  checkIsAdmin: (organizationId: string) => boolean | undefined
}
const useRole: () => IUseRole =
  () => {
    const { roles } = useFirebase()

    const checkIsAdmin: (organizationId: string) => boolean | undefined =
      useCallback((organizationId) => {
        if (roles === undefined) return
        if (roles === null) return false

        const systemRole = Object.entries(roles)
          .filter(([o]) => o === systemManagerOrganizationId)
          .map(([_, r]) => (r))
        if (systemRole && systemRole[0] === PermissionRoles.Admin) {
          return true
        }

        const organizationRole = Object.entries(roles)
          .filter(([o]) => o === organizationId)
          .map(([_, r]) => (r))
        if (organizationRole && organizationRole[0] === PermissionRoles.Admin) {
          return true
        }

        return false
      }, [roles])

    return {
      checkIsAdmin
    }
  }

export default useRole
