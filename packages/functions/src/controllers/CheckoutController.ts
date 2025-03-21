import { https } from 'firebase-functions/v1'
import CheckoutService from '../services/CheckoutService'
import type { SockbaseCheckoutGetPayload, SockbaseCheckoutRequest, SockbaseCheckoutResult } from 'sockbase'

export const treatCheckoutStatusWebhook = https
  .onRequest(async (req, res) =>
    await CheckoutService.processCoreAsync(req, res)
  )

export const getCheckoutBySessionId = https.onCall(
  async (payload: SockbaseCheckoutGetPayload, context): Promise<SockbaseCheckoutResult | null> => {
    if (!context.auth) {
      throw new https.HttpsError('permission-denied', 'Auth Error')
    }

    const userId = context.auth.uid
    const result = await CheckoutService.getCheckoutBySessionIdAsync(userId, payload.sessionId)

    return result
  })

export const hoge = https.onCall(
  async (_, context): Promise<SockbaseCheckoutRequest> => {
    if (!context.auth) {
      throw new https.HttpsError('permission-denied', 'Auth Error')
    }

    const result = await CheckoutService.createCheckoutSessionAsync()
    return result
  })
