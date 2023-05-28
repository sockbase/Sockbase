import type { SockbaseAccountDocument } from 'sockbase'
import FirebaseAdmin from '../libs/FirebaseAdmin'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()

export const getUserDataAsync: (userId: string) => Promise<SockbaseAccountDocument> =
  async (userId: string) => {
    const userDoc = await firestore.doc(`/users/${userId}`).get()
    const user = userDoc.data()
    if (!user) {
      throw new Error(`user not found (${userId})`)
    }

    return user as SockbaseAccountDocument
  }
