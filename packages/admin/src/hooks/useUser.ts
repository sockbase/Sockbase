import { useCallback } from 'react'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { accountDocumentConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseAccountDocument } from 'sockbase'

interface IUseUser {
  getUsersAsync: () => Promise<SockbaseAccountDocument[]>
  getUserAsync: (userId: string) => Promise<SockbaseAccountDocument>
}

const useUser = (): IUseUser => {
  const { getFirestore } = useFirebase()
  const db = getFirestore()

  const getUsersAsync = useCallback(async () => {
    const usersRef = collection(db, 'users')
      .withConverter(accountDocumentConverter)
    const users = await getDocs(usersRef)
    return users.docs.map(doc => doc.data())
  }, [])

  const getUserAsync = useCallback(async (userId: string) => {
    const userRef = doc(db, `/users/${userId}`)
      .withConverter(accountDocumentConverter)
    const userDoc = await getDoc(userRef)
    const user = userDoc.data()
    if (!user) {
      throw new Error(`User not found (${userId})`)
    }
    return user
  }, [])

  return {
    getUsersAsync,
    getUserAsync
  }
}

export default useUser
