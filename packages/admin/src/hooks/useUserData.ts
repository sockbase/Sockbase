import { useCallback } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { accountConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseAccount } from 'sockbase'

interface IUseUserData {
  getUserDataByUserIdAsync: (userId: string) => Promise<SockbaseAccount>
  getUserDataByUserIdAndEventIdAsync: (userId: string, eventId: string) => Promise<SockbaseAccount>
  getUserDataByUserIdAndStoreIdAsync: (userId: string, storeId: string) => Promise<SockbaseAccount>
}

const useUserData = (): IUseUserData => {
  const { getFirestore } = useFirebase()
  const db = getFirestore()

  const getUserDataByUserIdAsync =
    async (userId: string): Promise<SockbaseAccount> => {
      const userRef = doc(db, 'users', userId)
        .withConverter(accountConverter)
      const userDoc = await getDoc(userRef)
      if (!userDoc.exists()) {
        throw new Error('user not found')
      }
      return userDoc.data()
    }

  const getUserDataByUserIdAndEventIdAsync =
    useCallback(async (userId: string, eventId: string) => {
      const userRef = doc(db, `/events/${eventId}/_users/${userId}`)
        .withConverter(accountConverter)
      const userDoc = await getDoc(userRef)
      const user = userDoc.data()
      if (!user) {
        throw new Error('user not found')
      }
      return user
    }, [])

  const getUserDataByUserIdAndStoreIdAsync =
    useCallback(async (userId: string, storeId: string): Promise<SockbaseAccount> => {
      const db = getFirestore()
      const userRef = doc(db, `stores/${storeId}/_users/${userId}`)
        .withConverter(accountConverter)
      const userDoc = await getDoc(userRef)
      const user = userDoc.data()
      if (!user) {
        throw new Error(`user not found: ${userId}`)
      }
      return user
    }, [])

  return {
    getUserDataByUserIdAsync,
    getUserDataByUserIdAndEventIdAsync,
    getUserDataByUserIdAndStoreIdAsync
  }
}

export default useUserData
