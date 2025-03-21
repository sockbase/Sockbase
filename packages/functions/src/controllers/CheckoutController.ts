import { https } from 'firebase-functions/v1'
import { createCheckoutSessionAsync, getCheckoutBySessionIdAsync, processCoreAsync } from '../services/CheckoutService'
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
    const result = await getCheckoutBySessionIdAsync(userId, payload.sessionId)

    return result
  })

export const hoge = https.onCall(
  async (_, context): Promise<SockbaseCheckoutRequest | null> => {
    if (!context.auth) {
      throw new https.HttpsError('permission-denied', 'Auth Error')
    }

    const now = new Date()
    const userId = context.auth.uid
    const orgId = 'nectarition'
    const paymentMethod = 1
    const paymentAmount = 10000
    const bankTransferCode = '123456'
    const targetType = 'circle'
    const targetId = 'FOO0787ApmhnLQo59nZt'

    const result = await createCheckoutSessionAsync({
      userId,
      orgId,
      paymentMethod,
      paymentAmount,
      bankTransferCode,
      targetType,
      targetId,
      now,
      name: 'テスト'
    })

    return result.checkoutRequest
  })
