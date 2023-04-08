import * as functions from 'firebase-functions'
// import Stripe from 'stripe'
// const apiKey = process.env.STRIPE_SECRET_API_KEY ?? ''
// const stripe = new Stripe(apiKey, {
//   apiVersion: '2022-11-15'
// })

export const treatCheckoutStatusWebhook = functions.https.onRequest(async (req, res) => {
  const body = req.body
  console.log(body)
  res.send(body)
})
