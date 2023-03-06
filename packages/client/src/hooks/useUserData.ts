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
      email: data.email,
      isEmailVerified: data.isEmailVerified,
      birthday: new Date(data.birthday).getTime(),
      postalCode: data.postalCode,
      address: data.address,
      telephone: data.telephone
    }
  }
}

interface IUseUserData {
  getMyUserDataAsync: () => Promise<SockbaseAccount | null>
  getUserDataByUserId: (userId: string) => Promise<SockbaseAccount>
}
const useUserData: () => IUseUserData = () => {
  const { user, getFirestore } = useFirebase()

  const getMyUserDataAsync: () => Promise<SockbaseAccount | null> =
    useCallback(async () => {
      if (!user) {
        return null
      }

      const db = getFirestore()
      const userRef = FirestoreDB
        .doc(db, 'users', user.uid)
        .withConverter(userConverter)
      const snap = await FirestoreDB.getDoc(userRef)
      if (snap.exists()) {
        return snap.data()
      } else {
        throw new Error('user not found')
      }
    }, [user])

  const getUserDataByUserId: (userId: string) => Promise<SockbaseAccount> =
    async (userId) => {
      const db = getFirestore()
      const userRef = FirestoreDB.doc(db, 'users', userId)
        .withConverter(userConverter)
      const userDoc = await FirestoreDB.getDoc(userRef)
      if (userDoc.exists()) {
        return userDoc.data()
      } else {
        throw new Error('user not found')
      }
    }

  return {
    getMyUserDataAsync,
    getUserDataByUserId
  }
}

export default useUserData
