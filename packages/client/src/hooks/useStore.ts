import * as FirestoreDB from 'firebase/firestore'
import type { SockbaseStore } from 'sockbase'

import useFirebase from './useFirebase'

const storeConverter: FirestoreDB.FirestoreDataConverter<SockbaseStore> = {
  toFirestore: (store: SockbaseStore): FirestoreDB.DocumentData => ({}),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot, options: FirestoreDB.SnapshotOptions): SockbaseStore => {
    const data = snapshot.data()
    return {
      storeName: data.storeName,
      descriptions: data.descriptions,
      rules: data.rules,
      schedules: data.schedules,
      _organization: data._organization,
      types: data.types
    }
  }
}

interface IUseStore {
  getStoreByIdAsync: (storeId: string) => Promise<SockbaseStore>
}
const useStore: () => IUseStore = () => {
  const { getFirestore } = useFirebase()

  const getStoreByIdAsync: (storeId: string) => Promise<SockbaseStore> =
    async (storeId) => {
      const db = getFirestore()
      const storeRef = FirestoreDB
        .doc(db, 'stores', storeId)
        .withConverter(storeConverter)

      const storeDoc = await FirestoreDB.getDoc(storeRef)
      if (!storeDoc.exists()) {
        throw new Error('store not found')
      }

      return storeDoc.data()
    }

  return {
    getStoreByIdAsync
  }
}

export default useStore
