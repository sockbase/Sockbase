import { MD5, enc } from 'crypto-js'
import dayjs from 'dayjs'

import type { SockbaseAccount, SockbaseApplication, SockbaseApplicationAddedResult, SockbaseApplicationDocument, SockbaseEvent, SockbaseOrganization } from 'sockbase'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import * as functions from 'firebase-functions'

import fetch from 'node-fetch'

import firebaseAdmin from '../libs/FirebaseAdmin'
import { applicationConverter } from '../libs/converters'

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

export const createApplication = functions.https.onCall(async (app: SockbaseApplication, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('permission-denied', 'Auth Error')
  }

  const appDoc: SockbaseApplicationDocument = {
    ...app,
    userId: context.auth.uid,
    timestamp: 0,
    hashId: null
  }

  const adminApp = firebaseAdmin.getFirebaseAdmin()
  const addResult = await adminApp.firestore()
    .collection('applications')
    .withConverter(applicationConverter)
    .add(appDoc)

  const hashId = await generateHashId(app.eventId, addResult.id)

  // TODO: onCreateApplicationの処理を入れ込む。細かくメソッド化して呼び出す形にする。

  // TODO: 銀行振込の場合、決済情報をここで作る。
  // TODO: 銀行振込用コードを生成して、レスポンスに乗っける。

  const bankTransferCode = ''

  const result: SockbaseApplicationAddedResult = {
    hashId,
    bankTransferCode
  }
  return result
})

const generateHashId: (eventId: string, refId: string) => Promise<string> =
  async (eventId, refId) => {
    const salt = 'sockbase-yogurt-koharurikka516'
    const codeDigit = 8
    const refHashId = MD5(`${eventId}.${refId}.${salt}`)
      .toString(enc.Hex)
      .slice(0, codeDigit)
    const formatedDateTime = dayjs().format('YYYYMMDDHmmssSSS')
    const hashId = `${formatedDateTime}-${refHashId}`

    // await FirestoreDB.updateDoc(ref, { hashId })
    //   .catch((err: FirebaseError) => {
    //     throw err
    //   })

    return hashId
  }
