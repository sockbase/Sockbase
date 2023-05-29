
import type { SockbaseOrganizationWithMeta } from 'sockbase'
import FirebaseAdmin from '../libs/FirebaseAdmin'

import fetch from 'node-fetch'

const sendMessageToDiscord: (organizationId: string, messageBody: {
  content: string
  username: string
  embeds: Array<{
    title: string
    url: string
    color: number
    fields: Array<{
      name: string
      value: string
      inlined?: boolean
    }>
  }>
}) => Promise<void> =
  async (organizationId, messageBody) => {
    const adminApp = FirebaseAdmin.getFirebaseAdmin()
    const organizationDoc = await adminApp.firestore()
      .doc(`/organizations/${organizationId}`)
      .get()
    const organization = organizationDoc.data() as SockbaseOrganizationWithMeta

    await fetch(organization.config.discordWebhookURL, {
      method: 'POST',
      body: JSON.stringify(messageBody),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

export {
  sendMessageToDiscord
}
