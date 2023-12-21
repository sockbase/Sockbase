import { firestore, https, type Change, type EventContext } from 'firebase-functions'
import { type QueryDocumentSnapshot } from 'firebase-admin/firestore'
import {
  type SockbaseTicketAddedResult,
  type SockbaseTicket,
  type SockbaseTicketCreatedResult,
  type SockbaseTicketUsedStatus,
  type SockbaseTicketUserDocument
} from 'sockbase'
import StoreService from '../services/StoreService'

export const onTicketUserUsedStatusUpdated = firestore
  .document('/_tickets/{ticketId}/private/usedStatus')
  .onUpdate(async (change: Change<QueryDocumentSnapshot>, context: EventContext<{ ticketId: string }>) => {
    if (!change.after.exists) return

    const ticketId = context.params.ticketId
    const ticketUsedStatus = change.after.data() as SockbaseTicketUsedStatus

    await StoreService.updateTicketUsedStatusAsync(ticketId, ticketUsedStatus)
  })

export const onTicketUserAssigned = firestore
  .document('/_ticketUsers/{ticketHashId}')
  .onUpdate(async (change: Change<QueryDocumentSnapshot>) => {
    if (!change.after.exists) return

    const ticketUser = change.after.data() as SockbaseTicketUserDocument
    if (!ticketUser.usableUserId) return

    await StoreService.updateTicketUserDataAsync(ticketUser.storeId, ticketUser.usableUserId)
  })

export const createTicket = https.onCall(
  async (ticket: SockbaseTicket, context: https.CallableContext): Promise<SockbaseTicketAddedResult> => {
    if (!context.auth) {
      throw new https.HttpsError('permission-denied', 'Auth Error')
    }

    const userId = context.auth.uid

    const result = await StoreService.createTicketAsync(userId, ticket)
    return result
  })

export const createTicketForAdmin = https.onCall(
  async (param: { storeId: string, createTicketData: { email: string, typeId: string } }, context: https.CallableContext): Promise<SockbaseTicketCreatedResult> => {
    if (!context.auth?.token.roles || context.auth.token.roles?.system !== 2) {
      throw new https.HttpsError('permission-denied', 'Auth Error')
    }

    const userId = context.auth.uid

    const result = await StoreService.createTicketForAdminAsync(userId, param.storeId, param.createTicketData.typeId, param.createTicketData.email)
    return result
  }
)
