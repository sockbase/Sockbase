import { getFirebaseAdmin } from './FirebaseAdmin'
import { applicationConverter, applicationHashIdConverter, applicationLinksConverter } from './converters'
import type {
  SockbaseApplicationDocument,
  SockbaseApplicationHashIdDocument,
  SockbaseApplicationLinksDocument
} from 'sockbase'

const admin = getFirebaseAdmin()
const db = admin.firestore()

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

const applicationLib = {
  getApplicationsByEventIdAsync,
  getApplicationHashIdByEventIdAsync,
  getApplicationLinksByIdAsync
}

export default applicationLib
