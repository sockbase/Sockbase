import type {
  SockbaseApplication,
  SockbaseApplicationAddedResult,
  SockbaseApplicationDocument,
} from 'sockbase'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { firestore, https } from 'firebase-functions'

import ApplicationService from '../services/ApplicationService'

export const onCreateApplication = firestore
  .document('/_applications/{applicationId}')
  .onCreate(async (snapshot: QueryDocumentSnapshot) => {
    const app = snapshot.data() as SockbaseApplicationDocument
    await ApplicationService.fetchUserDataForEventAsync(app.userId, app.eventId)
      .then(() => console.log('application user data created'))
      .catch(err => { throw err })
  })

export const createApplication = https.onCall(
  async (app: SockbaseApplication, context): Promise<SockbaseApplicationAddedResult> => {
    if (!context.auth) {
      throw new https.HttpsError('permission-denied', 'Auth Error')
    }

    const userId = context.auth.uid
    
    const result = await ApplicationService.createApplicationAsync(userId, app)
    return result
  })
