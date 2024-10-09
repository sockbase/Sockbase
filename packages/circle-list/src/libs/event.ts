import { getFirebaseAdmin } from './FirebaseAdmin'
import { eventConverter, spaceConverter } from './converters'
import type { SockbaseEventDocument, SockbaseSpaceDocument } from 'sockbase'

const admin = getFirebaseAdmin()
const db = admin.firestore()

const getEventByIdAsync = async (eventId: string): Promise<SockbaseEventDocument> => {
  const eventDoc = await db.doc(`events/${eventId}`)
    .withConverter(eventConverter)
    .get()
  const event = eventDoc.data()
  if (!event) {
    throw new Error(`Event not found: ${eventId}`)
  }

  return event
}

const getSpacesByEventIdAsync = async (eventId: string): Promise<SockbaseSpaceDocument[]> => {
  const spaceDocs = await db.collection('spaces')
    .withConverter(spaceConverter)
    .where('eventId', '==', eventId)
    .get()
  const spaces = spaceDocs.docs
    .filter(d => d.exists)
    .map(d => d.data())
    .sort((a, b) => (a.spaceGroupOrder * 100 + a.spaceOrder) - (b.spaceGroupOrder * 100 + b.spaceOrder))

  return spaces
}

const eventLib = {
  getEventByIdAsync,
  getSpacesByEventIdAsync
}

export default eventLib
