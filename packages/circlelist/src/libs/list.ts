import { getFirebaseAdmin } from './FirebaseAdmin'
import { circleListControlConverter } from './converters'
import type { SockbaseCircleListControlDocument } from 'sockbase'

const admin = getFirebaseAdmin()
const db = admin.firestore()

const getListControlsAsync = async (): Promise<SockbaseCircleListControlDocument[]> => {
  const listControlDocs = await db.collection('circleListControls')
    .withConverter(circleListControlConverter)
    .get()
  const listControls = listControlDocs.docs
    .filter(d => d.exists)
    .map(d => d.data())

  return listControls
}

const listLib = {
  getListControlsAsync
}

export default listLib
