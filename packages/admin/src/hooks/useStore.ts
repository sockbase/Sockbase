import { useCallback } from 'react'
import { collection, query, where, getDocs, doc, getDoc, setDoc, runTransaction } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { storeConverter, ticketConverter, ticketHashIdConverter, ticketMetaConverter, ticketUsedStatusConverter, ticketUserConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import usePayment from './usePayment'
import type { SockbaseApplicationStatus, SockbaseStore, SockbaseStoreDocument, SockbaseAdminTicketCreateResult, SockbaseTicketDocument, SockbaseTicketHashIdDocument, SockbaseTicketMeta, SockbaseTicketUsedStatus, SockbaseTicketUserDocument } from 'sockbase'

interface IUseStore {
  getStoreByIdAsync: (storeId: string) => Promise<SockbaseStoreDocument>
  getStoresAsync: () => Promise<SockbaseStoreDocument[]>
  getStoresByOrganizationIdAsync: (organizationId: string) => Promise<SockbaseStoreDocument[]>
  getTicketByIdAsync: (ticketId: string) => Promise<SockbaseTicketDocument>
  getTicketIdByHashIdAsync: (ticketHashId: string) => Promise<SockbaseTicketHashIdDocument>
  getTicketsByUserIdAsync: (userId: string) => Promise<SockbaseTicketDocument[]>
  getUsableTicketsByUserIdAsync: (userId: string) => Promise<SockbaseTicketUserDocument[]>
  getTicketsByStoreIdAsync: (storeId: string) => Promise<SockbaseTicketDocument[]>
  getTicketMetaByIdAsync: (ticketId: string) => Promise<SockbaseTicketMeta>
  getTicketUserByHashIdAsync: (ticketHashId: string) => Promise<SockbaseTicketUserDocument>
  getTicketUserByHashIdNullableAsync: (ticketHashId: string) => Promise<SockbaseTicketUserDocument | null>
  getTicketUsedStatusByIdAsync: (ticketId: string) => Promise<SockbaseTicketUsedStatus>
  setTicketApplicationStatusAsync: (ticketId: string, status: SockbaseApplicationStatus) => Promise<void>
  createTicketForAdminAsync: (storeId: string, createTicketData: { email: string | null, typeId: string }) => Promise<SockbaseAdminTicketCreateResult>
  deleteTicketAsync: (ticketHashId: string) => Promise<void>
  createStoreAsync: (storeId: string, store: SockbaseStore) => Promise<void>
  updateTicketUsedStatusByIdAsync: (ticketId: string, used: boolean) => Promise<void>
}

const useStore = (): IUseStore => {
  const { getFirestore, getFunctions } = useFirebase()
  const db = getFirestore()
  const functions = getFunctions()
  const { getPaymentByIdAsync } = usePayment()

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

  const getStoresAsync =
    useCallback(async () => {
      const storesRef = collection(db, 'stores')
        .withConverter(storeConverter)
      const storesSnapshot = await getDocs(storesRef)
      const queryDocs = storesSnapshot.docs
        .map(doc => doc.data())
      return queryDocs
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

  const getTicketIdByHashIdAsync =
    useCallback(async (ticketHashId: string): Promise<SockbaseTicketHashIdDocument> => {
      const ticketHashRef = doc(db, '_ticketHashIds', ticketHashId)
        .withConverter(ticketHashIdConverter)
      const ticketHashDoc = await getDoc(ticketHashRef)
      const ticketHash = ticketHashDoc.data()
      if (!ticketHash) {
        throw new Error('ticketHash not found')
      }
      return ticketHash
    }, [])

  const getTicketByIdAsync =
    useCallback(async (ticketId: string): Promise<SockbaseTicketDocument> => {
      const db = getFirestore()
      const ticketRef = doc(db, '_tickets', ticketId)
        .withConverter(ticketConverter)
      const ticketDoc = await getDoc(ticketRef)
      if (!ticketDoc.exists()) {
        throw new Error('store not found')
      }
      return ticketDoc.data()
    }, [])

  const getTicketsByUserIdAsync =
  async (userId: string): Promise<SockbaseTicketDocument[]> => {
    const db = getFirestore()
    const ticketsRef = collection(db, '_tickets')
      .withConverter(ticketConverter)

    const ticketsQuery = query(
      ticketsRef,
      where('userId', '==', userId)
    )
    const ticketsSnapshot = await getDocs(ticketsQuery)
    const ticketsDocs = ticketsSnapshot.docs
      .filter(doc => doc.exists())
      .map(doc => doc.data())

    return ticketsDocs
  }

  const getUsableTicketsByUserIdAsync =
    useCallback(async (userId: string): Promise<SockbaseTicketUserDocument[]> => {
      const db = getFirestore()
      const ticketUsersRef = collection(db, '_ticketUsers')
        .withConverter(ticketUserConverter)

      const ticketUsersQuery = query(
        ticketUsersRef,
        where('usableUserId', '==', userId)
      )
      const ticketUsersSnapshot = await getDocs(ticketUsersQuery)
      const ticketUsersDocs = ticketUsersSnapshot.docs
        .filter(doc => doc.exists())
        .map(doc => doc.data())

      return ticketUsersDocs
    }, [])

  const getTicketsByStoreIdAsync =
    useCallback(async (storeId: string) => {
      const ticketsRef = collection(db, '_tickets')
        .withConverter(ticketConverter)
      const ticketsQuery = query(ticketsRef, where('storeId', '==', storeId))
      const ticketsSnapshot = await getDocs(ticketsQuery)
      const ticketsDocs = ticketsSnapshot.docs
        .filter(doc => doc.exists())
        .map(doc => doc.data())
      return ticketsDocs
    }, [])

  const getTicketMetaByIdAsync =
    async (ticketId: string): Promise<SockbaseTicketMeta> => {
      const ticketMetaRef = doc(db, `/_tickets/${ticketId}/private/meta`)
        .withConverter(ticketMetaConverter)
      const ticketMetaDoc = await getDoc(ticketMetaRef)
      const ticketMeta = ticketMetaDoc.data()
      if (!ticketMeta) {
        throw new Error('ticketMeta not found')
      }
      return ticketMeta
    }

  const getTicketUserByHashIdAsync =
    useCallback(async (ticketHashId: string): Promise<SockbaseTicketUserDocument> => {
      const ticketUserRef = doc(db, `/_ticketUsers/${ticketHashId}`)
        .withConverter(ticketUserConverter)
      const ticketUserDoc = await getDoc(ticketUserRef)
      const ticketUser = ticketUserDoc.data()
      if (!ticketUser) {
        throw new Error('ticketUser not found')
      }
      return ticketUser
    }, [])

  const getTicketUserByHashIdNullableAsync =
    useCallback(async (ticketHashId: string) => {
      return await getTicketUserByHashIdAsync(ticketHashId)
        .catch(() => null)
    }, [])

  const getTicketUsedStatusByIdAsync =
    useCallback(async (ticketId: string): Promise<SockbaseTicketUsedStatus> => {
      const db = getFirestore()
      const ticketUsedStatusRef = doc(db, `/_tickets/${ticketId}/private/usedStatus`)
        .withConverter(ticketUsedStatusConverter)
      const ticketUsedStatusDoc = await getDoc(ticketUsedStatusRef)
      const ticketUsedStatus = ticketUsedStatusDoc.data()
      if (!ticketUsedStatus) {
        throw new Error('ticketUsedStatus not found')
      }
      return ticketUsedStatus
    }, [])

  const setTicketApplicationStatusAsync =
    useCallback(async (ticketId: string, status: SockbaseApplicationStatus) => {
      const db = getFirestore()
      const ticketMetaRef = doc(db, `/_tickets/${ticketId}/private/meta`)
        .withConverter(ticketMetaConverter)

      await setDoc(
        ticketMetaRef,
        { applicationStatus: status },
        { merge: true })
    }, [])

  const createTicketForAdminAsync =
    useCallback(async (storeId: string, createTicketData: { email: string | null, typeId: string }): Promise<SockbaseAdminTicketCreateResult> => {
      const createTicketForAdminFunction = httpsCallable<
        { storeId: string, createTicketData: { email: string | null, typeId: string } },
        SockbaseAdminTicketCreateResult
      >(functions, 'store-createTicketForAdmin')

      const ticketResult = await createTicketForAdminFunction({ storeId, createTicketData })
      return ticketResult.data
    }, [])

  const deleteTicketAsync =
    useCallback(async (ticketHashId: string) => {
      const ticketHash = await getTicketIdByHashIdAsync(ticketHashId)
        .catch(err => { throw err })

      const payment = ticketHash.paymentId ? await getPaymentByIdAsync(ticketHash.paymentId) : null

      const db = getFirestore()
      const ticketMetaRef = doc(db, `_tickets/${ticketHash.ticketId}/private/meta`)
      const ticketUsedStatusRef = doc(db, `_tickets/${ticketHash.ticketId}/private/usedStatus`)
      const ticketRef = doc(db, `_tickets/${ticketHash.ticketId}`)
      const ticketUserRef = doc(db, `_ticketUsers/${ticketHash.hashId}`)
      const ticketHashRef = doc(db, `_ticketHashIds/${ticketHash.hashId}`)
      const paymentRef = payment ? doc(db, `_payments/${payment.id}`) : null
      const paymentHashRef = payment?.hashId ? doc(db, `_paymentHashes/${payment.hashId}`) : null

      await runTransaction(db, async tx => {
        tx.delete(ticketMetaRef)
        tx.delete(ticketUsedStatusRef)
        tx.delete(ticketRef)
        tx.delete(ticketUserRef)
        tx.delete(ticketHashRef)

        if (paymentRef) {
          tx.delete(paymentRef)
        }

        if (paymentHashRef) {
          tx.delete(paymentHashRef)
        }
      })
        .catch(err => { throw err })
    }, [])

  const createStoreAsync =
    useCallback(async (storeId: string, store: SockbaseStore) => {
      const db = getFirestore()
      const storeRef = doc(db, `/stores/${storeId}`)
        .withConverter(storeConverter)
      await setDoc(storeRef, store)
        .catch(err => { throw err })
    }, [])

  const updateTicketUsedStatusByIdAsync =
    useCallback(async (ticketId: string, used: boolean) => {
      const db = getFirestore()
      const ticketUsedStatusRef = doc(db, `/_tickets/${ticketId}/private/usedStatus`)
        .withConverter(ticketUsedStatusConverter)

      await setDoc(
        ticketUsedStatusRef,
        { used },
        { merge: true })
        .catch(err => { throw err })
    }, [])

  return {
    getStoreByIdAsync,
    getStoresAsync,
    getStoresByOrganizationIdAsync,
    getTicketByIdAsync,
    getTicketIdByHashIdAsync,
    getTicketsByUserIdAsync,
    getUsableTicketsByUserIdAsync,
    getTicketsByStoreIdAsync,
    getTicketMetaByIdAsync,
    getTicketUserByHashIdAsync,
    getTicketUserByHashIdNullableAsync,
    getTicketUsedStatusByIdAsync,
    setTicketApplicationStatusAsync,
    createTicketForAdminAsync,
    deleteTicketAsync,
    createStoreAsync,
    updateTicketUsedStatusByIdAsync
  }
}

export default useStore
