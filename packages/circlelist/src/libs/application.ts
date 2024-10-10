import { getFirebaseAdmin } from './FirebaseAdmin'
import { applicationConverter, applicationHashIdConverter, applicationLinksConverter } from './converters'
import type {
  SockbaseApplicationDocument,
  SockbaseApplicationHashIdDocument,
  SockbaseApplicationLinksDocument
} from 'sockbase'

const admin = getFirebaseAdmin()
const db = admin.firestore()
const storage = admin.storage().bucket()

const getApplicationsByEventIdAsync = async (eventId: string): Promise<SockbaseApplicationDocument[]> => {
  const appDocs = await db.collection('_applications')
    .withConverter(applicationConverter)
    .where('eventId', '==', eventId)
    .get()

  const apps = appDocs.docs
    .filter(d => d.exists)
    .map(d => d.data())

  return apps
}

const getApplicationHashIdByEventIdAsync = async (eventId: string): Promise<SockbaseApplicationHashIdDocument[]> => {
  const appHashDocs = await db.collection('_applicationHashIds')
    .withConverter(applicationHashIdConverter)
    .where('eventId', '==', eventId)
    .get()

  const appHashes = appHashDocs.docs
    .filter(d => d.exists)
    .map(d => d.data())

  return appHashes
}

const getApplicationLinksByIdAsync = async (appId: string): Promise<SockbaseApplicationLinksDocument> => {
  const appLinksDoc = await db.doc(`_applicationLinks/${appId}`)
    .withConverter(applicationLinksConverter)
    .get()
  const appLinks = appLinksDoc.data()
  if (!appLinks) {
    throw new Error(`ApplicationLinks not found: ${appId}`)
  }

  return appLinks
}

const getCircleCutURLByAppHashIdAsync = async (appHashId: string): Promise<string | null> => {
  const url = await storage.file(`circleCuts/${appHashId}`).getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60 * 25 // 1日に1回ビルドするので、24 + 1時間有効なURLを発行
  })
  return url[0]
}

const applicationLib = {
  getApplicationsByEventIdAsync,
  getApplicationHashIdByEventIdAsync,
  getApplicationLinksByIdAsync,
  getCircleCutURLByAppHashIdAsync
}

export default applicationLib
