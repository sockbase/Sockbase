import * as functions from 'firebase-functions'
import {
  type SockbaseTicketAddedResult,
  type SockbaseTicket,
  type SockbaseTicketCreatedResult,
  type SockbaseTicketUsedStatus
} from 'sockbase'
import StoreService from '../services/StoreService'
import { type QueryDocumentSnapshot } from 'firebase-admin/firestore'

export const onTicketUserUpdated = functions.firestore
  .document(`_tickets/{ticketId}/private/usedStatus`)
  .onUpdate(async (change: functions.Change<QueryDocumentSnapshot>, context: functions.EventContext<{ ticketId: string }>) => {
    if (!change.after.exists) return

    const ticketId = context.params.ticketId
    const ticketUsedStatus = change.after.data() as SockbaseTicketUsedStatus

    await StoreService.updateTicketUsedStatusAsync(ticketId, ticketUsedStatus)
  })

export const createTicket = functions.https.onCall(
  async (ticket: SockbaseTicket, context: functions.https.CallableContext): Promise<SockbaseTicketAddedResult> => {
    if (!context.auth) {
      throw new functions.https.HttpsError('permission-denied', 'Auth Error')
    }
    const userId = context.auth.uid
    const result = await StoreService.createTicketAsync(userId, ticket)
    return result
  })

export const createTicketForAdmin = functions.https.onCall(
  async (param: { storeId: string; createTicketData: { email: string; typeId: string; } }, context: functions.https.CallableContext): Promise<SockbaseTicketCreatedResult> => {
    if (!context.auth?.token.roles || context.auth.token.roles?.system !== 2) {
      throw new functions.https.HttpsError('permission-denied', 'Auth Error')
    }

    const userId = context.auth.uid

    const result = await StoreService.createTicketForAdminAsync(userId, param.storeId, param.createTicketData.typeId, param.createTicketData.email)
    return result
  }
)
