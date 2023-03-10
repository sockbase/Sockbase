import type { SockbaseAccount, SockbaseApplicationDocument } from 'sockbase'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import * as functions from 'firebase-functions'

import firebaseAdmin from '../libs/FirebaseAdmin'

export const onChangeApplication = functions.firestore
  .document('/applications/{applicationId}')
  .onUpdate(async (change: functions.Change<QueryDocumentSnapshot>, context: functions.EventContext<{ applicationId: string }>) => {
    if (!change.after.exists) return

    const adminApp = firebaseAdmin.getFirebaseAdmin()
    const appId = change.after.id
    const app = change.after.data() as SockbaseApplicationDocument
    if (!app.hashId) return

    const userDoc = await adminApp.firestore()
      .doc(`/users/${app.userId}`)
      .get()
    const user = userDoc.data() as SockbaseAccount

    await adminApp.firestore()
      .doc(`/_applicationHashIds/${app.hashId}`)
      .set({
        applicationId: appId,
        hashId: app.hashId
      })

    await adminApp.firestore()
      .doc(`/events/${app.eventId}/_users/${app.userId}`)
      .set(user)
  })
