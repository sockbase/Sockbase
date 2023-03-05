import { type UserRecord, getAuth } from 'firebase-admin/auth'
import type { SockbaseApplicationDocument, SockbaseEvent } from 'sockbase'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import * as functions from 'firebase-functions'

import firebaseAdmin from '../libs/FirebaseAdmin'

import mailConfig from '../configs/mail'

const getUser: (userId: string) => Promise<UserRecord> =
  async (userId) => {
    const adminApp = firebaseAdmin.getFirebaseAdmin()
    const auth = getAuth(adminApp)
    const user = await auth.getUser(userId)
    return user
  }

export const acceptApplication = functions.firestore
  .document('/events/{eventId}/applications/{applicationId}')
  .onCreate(async (snapshot: QueryDocumentSnapshot, context: functions.EventContext<{ eventId: string, applicationId: string }>) => {
    const adminApp = firebaseAdmin.getFirebaseAdmin()
    const app = snapshot.data() as SockbaseApplicationDocument
    const user = await getUser(app.userId)

    const eventDoc = await adminApp.firestore()
      .doc(`/events/${context.params.eventId}`)
      .get()
    const event = eventDoc.data() as SockbaseEvent

    const template = mailConfig.templates.acceptApplication(event, app)
    await adminApp.firestore()
      .collection('mail')
      .add({
        to: user.email,
        message: {
          subject: template.subject,
          text: template.body.join('\n')
        }
      })
  })
