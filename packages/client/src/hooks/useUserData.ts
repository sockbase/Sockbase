import { useCallback } from 'react'
import * as FirestoreDB from 'firebase/firestore'
import type { SockbaseAccount } from 'sockbase'

import useFirebase from './useFirebase'

const userConverter: FirestoreDB.FirestoreDataConverter<SockbaseAccount> = {
  toFirestore: (userData: SockbaseAccount): FirestoreDB.DocumentData => ({
    name: userData.name,
    email: userData.email,
    birthday: userData.birthday,
    postalCode: userData.postalCode,
    address: userData.address,
    telephone: userData.telephone
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
  updateUserDataAsync: (userId: string, userData: SockbaseAccount) => Promise<void>
  getMyUserDataAsync: () => Promise<SockbaseAccount | null>
  getUserDataByUserIdAsync: (userId: string) => Promise<SockbaseAccount>
  getUserDataByUserIdAndEventIdAsync: (userId: string, eventId: string) => Promise<SockbaseAccount>
}
const useUserData: () => IUseUserData = () => {
  const { user, getFirestore } = useFirebase()

  const updateUserDataAsync: (userId: string, userData: SockbaseAccount) => Promise<void> =
    async (userId, userData) => {
      const db = getFirestore()
      const userRef = FirestoreDB
        .doc(db, 'users', userId)
        .withConverter(userConverter)
      await FirestoreDB.setDoc(userRef, userData)
    }

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

  const getUserDataByUserIdAsync: (userId: string) => Promise<SockbaseAccount> =
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

  const getUserDataByUserIdAndEventIdAsync: (userId: string, eventId: string) => Promise<SockbaseAccount> =
    async (userId, eventId) => {
      const db = getFirestore()
      const userRef = FirestoreDB.doc(db, `/events/${eventId}/_users/${userId}`)
        .withConverter(userConverter)
      const userDoc = await FirestoreDB.getDoc(userRef)
      if (userDoc.exists()) {
        return userDoc.data()
      } else {
        throw new Error('user not found')
      }
    }

  return {
    updateUserDataAsync,
    getMyUserDataAsync,
    getUserDataByUserIdAsync,
    getUserDataByUserIdAndEventIdAsync
  }
}

export default useUserData