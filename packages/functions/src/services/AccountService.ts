import { FieldValue } from 'firebase-admin/firestore'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import {
  type SockbaseAccountDocument,
  type SockbaseRole
} from 'sockbase'
import { applicationConverter, roleConverter, ticketConverter } from '../libs/converters'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()
const auth = adminApp.auth()
const database = adminApp.database()

const updateUserRoleByOrganizationAsync =
  async (userId: string, organizationId: string, role: SockbaseRole): Promise<void> => {
    await firestore.doc(`/users/${userId}/_roles/${organizationId}`)
      .set({
        role
      }, {
        merge: true
      })
  }

const removeUserRoleByOrganizationAsync =
  async (userId: string, organizationId: string): Promise<void> => {
    await firestore.doc(`/users/${userId}/_roles/${organizationId}`)
      .set({
        role: FieldValue.delete()
      }, {
        merge: true
      })
  }

const getRolesAsync = async (userId: string): Promise<Record<string, number>> => {
  const rolesCollection = await firestore.collection(`/users/${userId}/_roles`)
    .withConverter(roleConverter)
    .get()
  const rolesDocs = rolesCollection.docs

  const roles = rolesDocs
    .filter(rd => rd.exists)
    .map(rd => ({ id: rd.id, data: rd.data() }))
    .reduce<Record<string, number>>((p, c) => ({ ...p, [c.id]: c.data.role }), {})

  return roles
}

const setRolesToClaimsAsync = async (userId: string, roles: Record<string, number>): Promise<void> => {
  await auth.setCustomUserClaims(userId, { roles })
}

const updateRolesByUserIdAsync = async (userId: string): Promise<void> => {
  const roles = await getRolesAsync(userId)
  await setRolesToClaimsAsync(userId, roles)
    .then(async () => {
      await database
        .ref(`_userMetas/${userId}/refreshTime`)
        .set(new Date().getTime())
    })
}

const updateUserDataAsync = async (userId: string, userData: SockbaseAccountDocument): Promise<void> => {
  await auth.updateUser(userId, {
    email: userData.email,
    emailVerified: false
  })

  await firestore.runTransaction(async tx => {
    const appsQuery = await firestore.collection('_applications')
      .withConverter(applicationConverter)
      .where('userId', '==', userId)
      .get()
    const ticketsQuery = await firestore.collection('_tickets')
      .withConverter(ticketConverter)
      .where('userId', '==', userId)
      .get()

    appsQuery.docs
      .map(app => app.data())
      .map(data => firestore.doc(`events/${data.eventId}/_users/${userId}`))
      .map(ref => tx.update(ref, { ...userData }))
    ticketsQuery.docs
      .map(ticket => ticket.data())
      .map(data => firestore.doc(`stores/${data.storeId}/_users/${userId}`))
      .map(ref => tx.update(ref, { ...userData }))
  })
}

export default {
  updateUserRoleByOrganizationAsync,
  removeUserRoleByOrganizationAsync,
  updateRolesByUserIdAsync,
  updateUserDataAsync
}
