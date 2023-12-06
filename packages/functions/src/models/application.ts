import { type SockbaseApplicationHashIdDocument, type SockbaseApplicationDocument } from 'sockbase'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { applicationConverter, applicationHashIdConverter } from '../libs/converters'

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

export {
  getApplicationByIdAsync,
  getApplicationByUserIdAndEventIdAsync,
  getApplicaitonHashIdAsync
}
