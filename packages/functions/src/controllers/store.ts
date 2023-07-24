import * as functions from 'firebase-functions'
// import firebaseAdmin from '../libs/FirebaseAdmin'

import { type SockbaseTicketAddedResult, type SockbaseTicket } from 'sockbase'
// import { storeConverter } from '../libs/converters'

export const createTicket = functions.https.onCall(
  async (ticket: SockbaseTicket, context): Promise<SockbaseTicketAddedResult> => {
    const now = new Date()

    // if (!context.auth) {
    //   throw new functions.https.HttpsError('permission-denied', 'Auth Error')
    // }

    // const userId = context.auth.uid
    // const storeId = ticket.storeId


    // const adminApp = firebaseAdmin.getFirebaseAdmin()
    // const firestore = adminApp.firestore()

    // const storeDoc = await firestore.doc(`stores/${storeId}`)
    //   .withConverter(storeConverter)
    //   .get()
    // if (!storeDoc.exists) {
    //   throw new functions.https.HttpsError('not-found', 'store')
    // }

    // const store = storeDoc.data()

    // const ticketDoc: SockbaseTicketDocument = {
    //   ...ticket,
    //   userId,
    //   createdAt: now,
    //   updatedAt: null
    // }

    const result: SockbaseTicketAddedResult = {
      hashId: now.toLocaleString(),
      bankTransferCode: now.getTime().toString()
    }
    return result
  })
