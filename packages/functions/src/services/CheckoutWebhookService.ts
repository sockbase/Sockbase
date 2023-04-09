import * as functions from 'firebase-functions'
import Stripe from 'stripe'

const apiKey = process.env.STRIPE_SECRET_API_KEY ?? ''
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET ?? ''

const stripe = new Stripe(apiKey, {
  apiVersion: '2022-11-15'
})

export const treatCheckoutStatusWebhook = functions.https.onRequest(async (req, res) => {
  const payload = req.body
  const sig = req.headers['stripe-signature'] as string
  let event
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret)
  } catch (err: unknown) {
    res.status(400).send(`Webhook Error: ${(err as Stripe.errors.StripeSignatureVerificationError).message}`)
    return
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      console.log('completed')

      if (session.payment_status === 'paid') {
        console.log('paied')
      }

      break
    }

    case 'checkout.session.async_payment_succeeded': {
      // const session = event.data.object as Stripe.Checkout.Session
      console.log('async_payment_succeeded')

      break
    }

    case 'checkout.session.async_payment_failed': {
      // const session = event.data.object as Stripe.Checkout.Session
      console.log('async_payment_failed')

      break
    }
  }

  res.send(event.data.object)
})
