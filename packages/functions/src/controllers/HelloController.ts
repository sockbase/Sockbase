import { https } from 'firebase-functions'
import HelloWorldService from '../services/HelloWorldService'

export const helloWorld = https
  .onRequest(async (_, res) => {
    const helloWorld = HelloWorldService.getHelloWorld()
    res.send(helloWorld)
  })

export const ping = https
  .onCall((data) => {
    return HelloWorldService.getPong(data)
  })
