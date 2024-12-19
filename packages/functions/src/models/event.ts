import { type SockbaseEvent } from 'sockbase'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { eventConverter } from '../libs/converters'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()

const getEventByIdAsync = async (eventId: string): Promise<SockbaseEvent> => {
  const eventDoc = await firestore
    .doc(`/events/${eventId}`)
    .withConverter(eventConverter)
    .get()
  const event = eventDoc.data()
  if (!event) {
    throw new Error('event not found')
  }

  return event
}

export {
  getEventByIdAsync
}
