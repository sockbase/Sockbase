import { useCallback } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { accountConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseAccount } from 'sockbase'

interface IUseUserData {
  getUserDataByUserIdAndEventIdAsync: (userId: string, eventId: string) => Promise<SockbaseAccount>
}

const useUserData = (): IUseUserData => {
  const { getFirestore } = useFirebase()
  const db = getFirestore()

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

  return {
    getUserDataByUserIdAndEventIdAsync
  }
}

export default useUserData
