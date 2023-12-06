import { https } from 'firebase-functions'
import CheckoutService from '../services/CheckoutService'

export const treatCheckoutStatusWebhook = https.onRequest(async (req, res) => 
  await CheckoutService.checkoutPaymentAsync(req, res)
)
