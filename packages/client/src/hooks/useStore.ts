import * as FirestoreDB from 'firebase/firestore'
import * as FirebaseFunctions from 'firebase/functions'
import type { SockbaseStoreDocument, SockbaseTicket, SockbaseTicketAddedResult } from 'sockbase'
import useFirebase from './useFirebase'

const storeConverter: FirestoreDB.FirestoreDataConverter<SockbaseStoreDocument> = {
  toFirestore: (store: SockbaseStoreDocument): FirestoreDB.DocumentData => ({}),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot, options: FirestoreDB.SnapshotOptions): SockbaseStoreDocument => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
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
  getStoreByIdAsync: (storeId: string) => Promise<SockbaseStoreDocument>
  getStoreByIdOptionalAsync: (storeId: string) => Promise<SockbaseStoreDocument | null>
  createTicketAsync: (ticket: SockbaseTicket) => Promise<SockbaseTicketAddedResult>
}

const useStore: () => IUseStore = () => {
  const { getFirestore, getFunctions } = useFirebase()

  const getStoreByIdAsync: (storeId: string) => Promise<SockbaseStoreDocument> =
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

  const getStoreByIdOptionalAsync = async (storeId: string): Promise<SockbaseStoreDocument | null> =>
    await getStoreByIdAsync(storeId)
      .then((store) => store)
      .catch(() => null)

  const createTicketAsync = async (ticket: SockbaseTicket): Promise<SockbaseTicketAddedResult> => {
    const functions = getFunctions()
    const createApplicationFunction = FirebaseFunctions
      .httpsCallable<SockbaseTicket, SockbaseTicketAddedResult>(functions, 'store-createTicket')

    const appResult = await createApplicationFunction(ticket)
    return appResult.data
  }

  return {
    getStoreByIdAsync,
    getStoreByIdOptionalAsync,
    createTicketAsync
  }
}

export default useStore
