import * as functions from 'firebase-functions'
import {
  type SockbaseTicketAddedResult,
  type SockbaseTicket,
  type SockbaseTicketDocument,
  type SockbaseAccount,
  type SockbaseTicketCreatedResult
} from 'sockbase'
import { type QueryDocumentSnapshot } from 'firebase-admin/firestore'
import firebaseAdmin from '../libs/FirebaseAdmin'
import { createTicketAsync, createTicketForAdminAsync } from '../services/StoreService'

export const onChangeApplication = functions.firestore
  .document('/_tickets/{ticketId}')
  .onUpdate(async (change: functions.Change<QueryDocumentSnapshot>) => {
    if (!change.after.exists) return

    const adminApp = firebaseAdmin.getFirebaseAdmin()
    const firestore = adminApp.firestore()

    const ticket = change.after.data() as SockbaseTicketDocument

    const userDoc = await firestore
      .doc(`/users/${ticket.userId}`)
      .get()
    if (!userDoc.exists) return

    const userData = userDoc.data() as SockbaseAccount
    await firestore
      .doc(`/stores/${ticket.storeId}/_users/${ticket.userId}`)
      .set(userData)
  })

export const createTicket = functions.https.onCall(
  async (ticket: SockbaseTicket, context: functions.https.CallableContext): Promise<SockbaseTicketAddedResult> => {
    if (!context.auth) {
      throw new functions.https.HttpsError('permission-denied', 'Auth Error')
    }
    const userId = context.auth.uid
    const result = await createTicketAsync(userId, ticket)
    return result
  })

export const createTicketForAdmin = functions.https.onCall(
  async (param: { storeId: string; createTicketData: { email: string; typeId: string; } }, context: functions.https.CallableContext): Promise<SockbaseTicketCreatedResult> => {
    if (!context.auth || !context.auth.token.roles) {
      throw new functions.https.HttpsError('permission-denied', 'Auth Error')
    }

    const userId = context.auth.uid

    const result = await createTicketForAdminAsync(userId, param.storeId, param.createTicketData.typeId, param.createTicketData.email)
    return result
  }
)
