import { useCallback } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { accountDocumentConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseAccountDocument } from 'sockbase'

interface IUseUser {
  getUsersAsync: () => Promise<SockbaseAccountDocument[]>
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

  return {
    getUsersAsync
  }
}

export default useUser
