import FirebaseAdmin from '../libs/FirebaseAdmin'
import { ticketConverter, ticketHashIdConverter } from '../libs/converters'
import type { SockbaseTicketHashIdDocument, SockbaseTicketDocument } from 'sockbase'

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

const getTicketHashIdAsync = async (ticketHashId: string): Promise<SockbaseTicketHashIdDocument> => {
  const ticketHashDoc = await firestore.doc(`_ticketsHashIds/${ticketHashId}`)
    .withConverter(ticketHashIdConverter)
    .get()
  const ticketHash = ticketHashDoc.data()
  if (!ticketHash) {
    throw new Error('ticketHash not found')
  }
  return ticketHash
}

export {
  getTicketByIdAsync,
  getTicketHashIdAsync
}
