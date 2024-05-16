import { type SockbaseApplicationHashIdDocument, type SockbaseApplicationDocument, type SockbaseApplicationMeta } from 'sockbase'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { applicationConverter, applicationHashIdConverter, applicationMetaConverter } from '../libs/converters'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()

const getApplicationByIdAsync = async (appId: string): Promise<SockbaseApplicationDocument> => {
  const appDoc = await firestore
    .doc(`/_applications/${appId}`)
    .withConverter(applicationConverter)
    .get()
  const app = appDoc.data()
  if (!app) {
    throw new Error('application not found')
  }

  return app
}

const getApplicationByUserIdAndEventIdAsync = async (userId: string, eventId: string): Promise<SockbaseApplicationDocument | null> => {
  const appCollection = await firestore.collection('_applications')
    .withConverter(applicationConverter)
    .where('userId', '==', userId)
    .where('eventId', '==', eventId)
    .get()

  const appDocs = appCollection.docs.map(a => a.data())
  if (appDocs.length === 0) {
    return null
  }

  return appDocs[0]
}

const getApplicaitonHashIdAsync = async (appHashId: string): Promise<SockbaseApplicationHashIdDocument> => {
  const appHashDoc = await firestore
    .doc(`/_applicationHashIds/${appHashId}`)
    .withConverter(applicationHashIdConverter)
    .get()
  const appHash = appHashDoc.data()
  if (!appHash) {
    throw new Error('application hash not found')
  }

  return appHash
}

const getApplicationsByEventIdAsync = async (eventId: string): Promise<SockbaseApplicationDocument[]> => {
  const appCollection = await firestore
    .collection('_applications')
    .withConverter(applicationConverter)
    .where('eventId', '==', eventId)
    .get()

  const appDocs = appCollection.docs
    .map(a => a.data())
  return appDocs
}

const getApplicationMetaByAppIdAsync = async (appId: string): Promise<SockbaseApplicationMeta> => {
  const appMetaDoc = await firestore
    .doc(`/_applications/${appId}/private/meta`)
    .withConverter(applicationMetaConverter)
    .get()
  const appMeta = appMetaDoc.data()
  if (!appMeta) {
    throw new Error('application meta not found')
  }

  return appMeta
}

export {
  getApplicationByIdAsync,
  getApplicationByUserIdAndEventIdAsync,
  getApplicaitonHashIdAsync,
  getApplicationsByEventIdAsync,
  getApplicationMetaByAppIdAsync
}
