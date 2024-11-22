import { https } from 'firebase-functions/v1'
import CheckoutService from '../services/CheckoutService'

export const treatCheckoutStatusWebhook = https
  .onRequest(async (req, res) =>
    await CheckoutService.processCoreAsync(req, res)
  )
