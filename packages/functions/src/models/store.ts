import { type SockbaseStoreDocument } from 'sockbase'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { storeConverter } from '../libs/converters'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()

const getStoreByIdAsync = async (storeId: string): Promise<SockbaseStoreDocument> => {
  const storeDoc = await firestore
    .doc(`/stores/${storeId}`)
    .withConverter(storeConverter)
    .get()
  const store = storeDoc.data()
  if (!store) {
    throw new Error('store not found')
  }

  return store
}

export {
  getStoreByIdAsync
}
