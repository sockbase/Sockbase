import { useCallback } from 'react'
import * as FirestoreDB from 'firebase/firestore'
import { accountConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseAccount } from 'sockbase'

interface IUseUserData {
  updateUserDataAsync: (userId: string, userData: SockbaseAccount) => Promise<void>
  getMyUserDataAsync: () => Promise<SockbaseAccount | null>
  getUserDataByUserIdAsync: (userId: string) => Promise<SockbaseAccount>
  getUserDataByUserIdAndEventIdAsync: (userId: string, eventId: string) => Promise<SockbaseAccount>
  getUserDataByUserIdAndStoreIdAsync: (userId: string, storeId: string) => Promise<SockbaseAccount>
  getUserDataByUserIdAndStoreIdOptionalAsync: (userId: string, storeId: string) => Promise<SockbaseAccount | null>
}
const useUserData = (): IUseUserData => {
  const { user, getFirestore } = useFirebase()

  const updateUserDataAsync =
    async (userId: string, userData: SockbaseAccount): Promise<void> => {
      const db = getFirestore()
      const userRef = FirestoreDB.doc(db, 'users', userId)
        .withConverter(accountConverter)
      await FirestoreDB.setDoc(userRef, userData)
    }

  const getMyUserDataAsync =
    useCallback(async (): Promise<SockbaseAccount | null> => {
      if (!user) {
        return null
      }

      const db = getFirestore()
      const userRef = FirestoreDB.doc(db, 'users', user.uid)
        .withConverter(accountConverter)
      const snap = await FirestoreDB.getDoc(userRef)
      if (snap.exists()) {
        return snap.data()
      } else {
        throw new Error('user not found')
      }
    }, [user])

  const getUserDataByUserIdAsync =
    async (userId: string): Promise<SockbaseAccount> => {
      const db = getFirestore()
      const userRef = FirestoreDB.doc(db, 'users', userId)
        .withConverter(accountConverter)
      const userDoc = await FirestoreDB.getDoc(userRef)
      if (userDoc.exists()) {
        return userDoc.data()
      } else {
        throw new Error('user not found')
      }
    }

  const getUserDataByUserIdAndEventIdAsync =
    async (userId: string, eventId: string): Promise<SockbaseAccount> => {
      const db = getFirestore()
      const userRef = FirestoreDB.doc(db, `/events/${eventId}/_users/${userId}`)
        .withConverter(accountConverter)

      const userDoc = await FirestoreDB.getDoc(userRef)

      const user = userDoc.data()
      if (!user) {
        throw new Error('user not found')
      }

      return user
    }

  const getUserDataByUserIdAndStoreIdAsync =
    async (userId: string, storeId: string): Promise<SockbaseAccount> => {
      const db = getFirestore()
      const userRef = FirestoreDB.doc(db, `stores/${storeId}/_users/${userId}`)
        .withConverter(accountConverter)

      const userDoc = await FirestoreDB.getDoc(userRef)

      const user = userDoc.data()
      if (!user) {
        throw new Error(`user not found: ${userId}`)
      }

      return user
    }

  const getUserDataByUserIdAndStoreIdOptionalAsync =
    async (userId: string, storeId: string): Promise<SockbaseAccount | null> =>
      await getUserDataByUserIdAndStoreIdAsync(userId, storeId).catch((err) => {
        console.error(err)
        return null
      })

  return {
    updateUserDataAsync,
    getMyUserDataAsync,
    getUserDataByUserIdAsync,
    getUserDataByUserIdAndEventIdAsync,
    getUserDataByUserIdAndStoreIdAsync,
    getUserDataByUserIdAndStoreIdOptionalAsync
  }
}

export default useUserData
