import { type QueryDocumentSnapshot } from 'firebase-admin/firestore'
import type { SockbaseAccountDocument, SockbaseRole } from 'sockbase'
import { firestore, type EventContext, type Change } from 'firebase-functions'

import AccountService from '../services/AccountService'

export const onChangeOrganizationRoles = firestore
  .document('/organizations/{organizationId}/users/{userId}')
  .onUpdate(
    (
      snapshot: Change<QueryDocumentSnapshot>,
      context: EventContext<{ organizationId: string, userId: string }>
    ) => {
      const { userId, organizationId } = context.params

      if (!snapshot.after.exists) {
        AccountService.removeUserRoleByOrganizationAsync(userId, organizationId)
          .catch(err => { throw err })
        return
      }

      AccountService.updateUserRoleByOrganizationAsync(
        userId,
        organizationId,
        snapshot.after.data().role as SockbaseRole)
        .catch(err => { throw err })
    })

export const onChangeUserRoles = firestore
  .document('/users/{userId}/_roles/{organizationId}')
  .onUpdate(
    async (
      _,
      context: EventContext<{ userId: string, organizationId: string }>
    ) => {
      await AccountService.updateRolesByUserIdAsync(context.params.userId)
        .then(() => console.log('roles claim updated'))
        .catch(err => { throw err })
    }
  )

export const onChangeUser = firestore
  .document('/users/{userId}')
  .onUpdate(
    (
      change: Change<QueryDocumentSnapshot>,
      context: EventContext<{ userId: string }>
    ) => {
      if (!change.after.exists) return
      const userId = context.params.userId
      const userData = change.after.data() as SockbaseAccountDocument

      AccountService.updateUserDataAsync(userId, userData)
        .catch(err => { throw err })
    }
  )
