import { type SockbaseTicketDocument } from 'sockbase'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { ticketConverter } from '../libs/converters'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()

const getTicketByIdAsync = async (ticketId: string): Promise<SockbaseTicketDocument> => {
  const ticketDoc = await firestore
    .doc(`/_tickets/${ticketId}`)
    .withConverter(ticketConverter)
    .get()
  const ticket = ticketDoc.data()
  if (!ticket) {
    throw new Error('ticket not found')
  }

  return ticket
}

export {
  getTicketByIdAsync
}
