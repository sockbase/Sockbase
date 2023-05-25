import { FieldValue, type QueryDocumentSnapshot } from 'firebase-admin/firestore'
import type { SockbaseAccountDocument } from 'sockbase'
import * as functions from 'firebase-functions'
import { type Change } from 'firebase-functions'

import FirebaseAdmin from '../libs/FirebaseAdmin'
import { roleConverter } from '../libs/converters'

export const onChangeOrganizationRoles = functions.firestore
  .document('/organizations/{organizationId}/users/{userId}')
  .onUpdate(
    (
      snapshot: Change<QueryDocumentSnapshot>,
      context: functions.EventContext<{ organizationId: string, userId: string }>
    ) => {
      const adminApp = FirebaseAdmin.getFirebaseAdmin()
      const firestore = adminApp.firestore()

      if (!snapshot.after.exists) {
        firestore
          .doc(`/users/${context.params.userId}/_roles/${context.params.organizationId}`)
          .set({
            role: FieldValue.delete()
          }, { merge: true })
          .catch(err => {
            throw err
          })
        return
      }

      firestore
        .doc(`/users/${context.params.userId}/_roles/${context.params.organizationId}`)
        .set({
          role: snapshot.after.data().role
        }, { merge: true })
        .catch(err => {
          throw err
        })
    })

export const onChangeUserRoles = functions.firestore
  .document('/users/{userId}/_roles/{organizationId}')
  .onUpdate(
    async (
      change: Change<QueryDocumentSnapshot>,
      context: functions.EventContext<{ userId: string, organizationId: string }>
    ) => {
      const adminApp = FirebaseAdmin.getFirebaseAdmin()
      const firestore = adminApp.firestore()
      const auth = adminApp.auth()

      const rolesCol = await firestore
        .collection(`/users/${context.params.userId}/_roles`)
        .withConverter(roleConverter)
        .get()
      const rolesDocs = rolesCol.docs

      const roles = rolesDocs
        .filter(rd => rd.exists)
        .map(rd => ({ id: rd.id, data: rd.data() }))
        .reduce<Record<string, number>>((p, c) => ({ ...p, [c.id]: c.data.role }), {})

      auth.setCustomUserClaims(context.params.userId, {
        roles
      })
        .catch(err => {
          throw err
        })
    }
  )

export const onChangeUser = functions.firestore
  .document('/users/{userId}')
  .onUpdate(
    async (
      change: Change<QueryDocumentSnapshot>,
      context: functions.EventContext<{ userId: string }>
    ) => {
      if (!change.after.exists) return
      const data = change.after.data() as SockbaseAccountDocument

      const adminApp = FirebaseAdmin.getFirebaseAdmin()
      const auth = adminApp.auth()

      auth.updateUser(context.params.userId, {
        email: data.email,
        emailVerified: false
      })
        .catch(err => { throw err })
    }
  )
