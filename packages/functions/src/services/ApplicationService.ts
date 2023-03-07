import type { SockbaseApplicationDocument } from 'sockbase'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import * as functions from 'firebase-functions'

import firebaseAdmin from '../libs/FirebaseAdmin'

export const onCreatedApplication = functions.firestore
  .document('/applications/{applicationId}')
  .onUpdate(async (change: functions.Change<QueryDocumentSnapshot>, context: functions.EventContext<{ applicationId: string }>) => {
    const adminApp = firebaseAdmin.getFirebaseAdmin()
    const appId = change.after.id
    const app = change.after.data() as SockbaseApplicationDocument

    if (!app.hashId) return
    await adminApp.firestore()
      .doc(`applicationHashIds/${app.eventId}/hashIds/${app.hashId}`)
      .set({
        applicationId: appId,
        hashId: app.hashId
      })
  })
