import { https } from 'firebase-functions/v1'
import { getCheckoutBySessionIdAsync, processCoreAsync, refreshCheckoutSessionAsync } from '../services/CheckoutService'
import type { SockbaseCheckoutGetPayload, SockbaseCheckoutRequest, SockbaseCheckoutResult } from 'sockbase'

export const treatCheckoutStatusWebhook = https
  .onRequest(async (req, res) =>
    await processCoreAsync(req, res)
  )

export const getCheckoutBySessionId = https.onCall(
  async (payload: SockbaseCheckoutGetPayload, context): Promise<SockbaseCheckoutResult | null> => {
    if (!context.auth) {
      throw new https.HttpsError('permission-denied', 'Auth Error')
    }

    const userId = context.auth.uid
    return await getCheckoutBySessionIdAsync(userId, payload.sessionId)
  })

export const refreshCheckoutSession = https.onCall(
  async (payload: { paymentId: string }, context): Promise<SockbaseCheckoutRequest | null> => {
    if (!context.auth) {
      throw new https.HttpsError('permission-denied', 'Auth Error')
    }

    const userId = context.auth.uid
    return await refreshCheckoutSessionAsync(userId, payload.paymentId)
  })
