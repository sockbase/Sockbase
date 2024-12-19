import fetch from 'node-fetch'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import type { SockbaseOrganizationWithMeta } from 'sockbase'

const sendMessageToDiscord: (organizationId: string, messageBody: {
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

    const bodyWithRoles = {
      ...messageBody,
      content: `<@&${organization.config.discordRoleId}>`
    }

    await fetch(organization.config.discordWebhookURL, {
      method: 'POST',
      body: JSON.stringify(bodyWithRoles),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

export {
  sendMessageToDiscord
}
