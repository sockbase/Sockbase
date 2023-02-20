import * as functions from 'firebase-functions'

export const helloWorld = functions.https.onRequest(async (req, res) => {
  res.send('hello world!')
})

export const ping = functions.https.onRequest(async (req, res) => {
  res.send('pong')
})
