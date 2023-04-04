import type { SockbaseAccount, SockbaseApplicationDocument, SockbaseEvent, SockbaseOrganization } from 'sockbase'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import * as functions from 'firebase-functions'

import fetch from 'node-fetch'

import firebaseAdmin from '../libs/FirebaseAdmin'

export const onCreateApplication = functions.firestore
  .document('/applications/{applicationId}')
  .onCreate(async (snapshot: QueryDocumentSnapshot, context: functions.EventContext<{ applicationId: string }>) => {
    const adminApp = firebaseAdmin.getFirebaseAdmin()

    const app = snapshot.data() as SockbaseApplicationDocument
    const eventDoc = await adminApp.firestore()
      .doc(`/events/${app.eventId}`)
      .get()
    const event = eventDoc.data() as SockbaseEvent

    // TODO: hashIdのTOODと合わせて申し込み作成関連周りひっくるめて対応する形でも良いかもしれない

    await adminApp.firestore()
      .doc(`/applications/${context.params.applicationId}/private/meta`)
      .set({
        applicationStatus: 0
      })

    const webhookBody = {
      content: '',
      username: `Sockbase: ${event.eventName}`,
      embeds: [
        {
          title: 'サークル申し込みを受け付けました！',
          url: '',
          fields: [
            {
              name: 'サークル名',
              value: app.circle.name
            }
          ]
        }
      ]
    }

    const organizationDoc = await adminApp.firestore()
      .doc(`/organizations/${event._organization.id}`)
      .get()
    const organization = organizationDoc.data() as SockbaseOrganization

    // TODO: libsに切り分ける
    await fetch(organization.config.discordWebhookURL, {
      method: 'POST',
      body: JSON.stringify(webhookBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  })

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
