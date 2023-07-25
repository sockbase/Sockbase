import * as FirestoreDB from 'firebase/firestore'
import * as FirebaseFunctions from 'firebase/functions'
import type { SockbaseStoreDocument, SockbaseTicket, SockbaseTicketAddedResult, SockbaseTicketDocument } from 'sockbase'
import useFirebase from './useFirebase'

const storeConverter: FirestoreDB.FirestoreDataConverter<SockbaseStoreDocument> = {
  toFirestore: (): FirestoreDB.DocumentData => ({}),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot, options: FirestoreDB.SnapshotOptions): SockbaseStoreDocument => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      storeName: data.storeName,
      storeWebURL: data.storeWebURL,
      descriptions: data.descriptions,
      rules: data.rules,
      schedules: data.schedules,
      _organization: data._organization,
      types: data.types
    }
  }
}

const ticketConverter: FirestoreDB.FirestoreDataConverter<SockbaseTicketDocument> = {
  toFirestore: () => ({}),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot): SockbaseTicketDocument => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      userId: data.userId,
      storeId: data.storeId,
      typeId: data.typeId,
      paymentMethod: data.paymentMethod,
      paymentProductId: data.paymentProductId,
      createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : null,
      updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : null,
      hashId: data.hashId
    }
  }
}

interface IUseStore {
  getStoreByIdAsync: (storeId: string) => Promise<SockbaseStoreDocument>
  getStoreByIdOptionalAsync: (storeId: string) => Promise<SockbaseStoreDocument | null>
  createTicketAsync: (ticket: SockbaseTicket) => Promise<SockbaseTicketAddedResult>
  getTicketByIdAsync: (ticketId: string) => Promise<SockbaseTicketDocument>
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

  const getTicketByIdAsync = async (ticketId: string): Promise<SockbaseTicketDocument> => {
    const db = getFirestore()
    const ticketRef = FirestoreDB
      .doc(db, '_tickets', ticketId)
      .withConverter(ticketConverter)

    const ticketDoc = await FirestoreDB.getDoc(ticketRef)
    if (!ticketDoc.exists()) {
      throw new Error('store not found')
    }

    return ticketDoc.data()
  }

  return {
    getStoreByIdAsync,
    getStoreByIdOptionalAsync,
    createTicketAsync,
    getTicketByIdAsync
  }
}

export default useStore
