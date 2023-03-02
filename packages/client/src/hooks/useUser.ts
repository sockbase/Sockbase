import { useCallback } from 'react'
import * as FirestoreDB from 'firebase/firestore'
import type { SockbaseAccount } from 'sockbase'

import useFirebase from './useFirebase'

const userConverter: FirestoreDB.FirestoreDataConverter<SockbaseAccount> = {
  toFirestore: (user: SockbaseAccount): FirestoreDB.DocumentData => ({
  }),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot, options: FirestoreDB.SnapshotOptions): SockbaseAccount => {
    const data = snapshot.data()
    return {
      name: data.name,
      birthday: new Date(data.birthday).getTime(),
      postalCode: data.postalCode,
      address: data.address,
      telephone: data.telephone
    }
  }
}

interface IUseUser {
  getMyUserDataAsync: () => Promise<SockbaseAccount | null>
}
const useUser: () => IUseUser = () => {
  const { user, getFirestore } = useFirebase()

  const getMyUserDataAsync: () => Promise<SockbaseAccount | null> =
    useCallback(async () => {
      if (!user) {
        return null
      }

      const db = getFirestore()
      const userDoc = FirestoreDB
        .doc(db, 'users', user.uid)
        .withConverter(userConverter)
      const snap = await FirestoreDB.getDoc(userDoc)
      if (snap.exists()) {
        console.log(snap.data())
        return snap.data()
      } else {
        throw new Error('userId not found')
      }
    }, [user])

  return {
    getMyUserDataAsync
  }
}

export default useUser
