import * as admin from 'firebase-admin'

const getFirebaseAdmin: () => admin.app.App =
  () => {
    return admin.apps.length !== 0 && admin.apps[0]
      ? admin.apps[0]
      : admin.initializeApp()
  }

export default {
  getFirebaseAdmin
}
