import { type QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { firestore, type EventContext, type Change } from 'firebase-functions/v1'

import AccountService from '../services/AccountService'
import type { SockbaseAccountDocument, SockbaseRole } from 'sockbase'

export const onCreateOrganizationRoles = firestore
  .document('/organizations/{organizationId}/users/{userId}')
  .onCreate(
    async (
      snapshot: QueryDocumentSnapshot,
      context: EventContext<{ organizationId: string, userId: string }>
    ) => {
      const { userId, organizationId } = context.params

      await AccountService
        .updateUserRoleByOrganizationAsync(
          userId,
          organizationId,
          snapshot.data().role as SockbaseRole)
        .then(() => console.log('organization role updated'))
        .catch(err => { throw err })
    })

export const onChangeOrganizationRoles = firestore
  .document('/organizations/{organizationId}/users/{userId}')
  .onUpdate(
    async (
      snapshot: Change<QueryDocumentSnapshot>,
      context: EventContext<{ organizationId: string, userId: string }>
    ) => {
      const { userId, organizationId } = context.params

      if (!snapshot.after.exists) {
        AccountService.removeUserRoleByOrganizationAsync(userId, organizationId)
          .catch(err => { throw err })
        return
      }

      await AccountService
        .updateUserRoleByOrganizationAsync(
          userId,
          organizationId,
          snapshot.after.data().role as SockbaseRole)
        .then(() => console.log('organization role updated'))
        .catch(err => { throw err })
    })

export const onCreateUserRoles = firestore
  .document('/users/{userId}/_roles/{organizationId}')
  .onCreate(
    async (
      _,
      context: EventContext<{ userId: string, organizationId: string }>
    ) => {
      await AccountService.updateRolesByUserIdAsync(context.params.userId)
        .then(() => console.log('roles claim updated'))
        .catch(err => { throw err })
    }
  )

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
    async (
      change: Change<QueryDocumentSnapshot>,
      context: EventContext<{ userId: string }>
    ) => {
      if (!change.after.exists) return
      const userId = context.params.userId
      const userData = change.after.data() as SockbaseAccountDocument

      await AccountService.updateUserDataAsync(userId, userData)
        .then(() => console.log('user data updated'))
        .catch(err => { throw err })
    }
  )
