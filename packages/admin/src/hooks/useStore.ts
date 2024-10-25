import { useCallback } from 'react'
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { storeConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseStoreDocument } from 'sockbase'

interface IUseStore {
  getStoreByIdAsync: (storeId: string) => Promise<SockbaseStoreDocument>
  getStoresByOrganizationIdAsync: (organizationId: string) => Promise<SockbaseStoreDocument[]>
}
const useStore = (): IUseStore => {
  const { getFirestore } = useFirebase()
  const db = getFirestore()

  const getStoreByIdAsync =
    useCallback(async (storeId: string) => {
      const storeRef = doc(db, 'stores', storeId)
        .withConverter(storeConverter)

      const storeDoc = await getDoc(storeRef)
      if (!storeDoc.exists()) {
        throw new Error('store not found')
      }

      return storeDoc.data()
    }, [])

  const getStoresByOrganizationIdAsync =
    useCallback(async (organizationId: string) => {
      const storesRef = collection(db, 'stores')
        .withConverter(storeConverter)
      const storesQuery = query(
        storesRef,
        where('_organization.id', '==', organizationId))
      const storesSnapshot = await getDocs(storesQuery)
      const queryDocs = storesSnapshot.docs
        .filter(doc => doc.exists())
        .map(doc => doc.data())
      return queryDocs
    }, [])

  return {
    getStoreByIdAsync,
    getStoresByOrganizationIdAsync
  }
}

export default useStore
