import { https } from 'firebase-functions/v1'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { eventConverter } from '../libs/converters'

import EventService from '../services/EventService'
import type { SockbaseCirclePassCreateResult } from 'sockbase'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const FirestoreDB = adminApp.firestore()

export const createPasses = https.onCall(
  async (eventId: string, context): Promise<SockbaseCirclePassCreateResult> => {
    if (!context.auth?.token.roles) {
      throw new https.HttpsError('permission-denied', 'Auth Error')
    }

    const eventDoc = await FirestoreDB
      .doc(`events/${eventId}`)
      .withConverter(eventConverter)
      .get()
    const event = eventDoc.data()
    if (!event) {
      throw new https.HttpsError('not-found', 'event')
    }
    else if (context.auth.token.roles?.[event._organization.id] < 2) {
      throw new https.HttpsError('permission-denied', 'Auth Error')
    }

    const result = await EventService.createPassesAsync(context.auth.uid, eventId)
    return result
  })
