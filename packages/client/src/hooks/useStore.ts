import { useCallback } from 'react'
import * as FirestoreDB from 'firebase/firestore'
import * as FirebaseFunctions from 'firebase/functions'
import {
  storeConverter,
  ticketConverter,
  ticketHashIdConverter,
  ticketMetaConverter,
  ticketUsedStatusConverter,
  ticketUserConverter
} from '../libs/converters'
import useFirebase from './useFirebase'
import type * as sockbase from 'sockbase'

interface IUseStore {
  getStoreByIdAsync: (storeId: string) => Promise<sockbase.SockbaseStoreDocument>
  getStoreByIdOptionalAsync: (storeId: string) => Promise<sockbase.SockbaseStoreDocument | null>
  getStoresByOrganizationIdAsync: (organizationId: string) => Promise<sockbase.SockbaseStoreDocument[]>
  createStoreAsync: (storeId: string, store: sockbase.SockbaseStore) => Promise<void>
  createTicketAsync: (ticket: sockbase.SockbaseTicket) => Promise<sockbase.SockbaseTicketAddedResult>
  createTicketForAdminAsync: (storeId: string, createTicketData: { email: string, typeId: string }) => Promise<sockbase.SockbaseTicketCreatedResult>
  getTicketIdByHashIdAsync: (ticketHashId: string) => Promise<sockbase.SockbaseTicketHashIdDocument>
  getTicketByIdAsync: (ticketId: string) => Promise<sockbase.SockbaseTicketDocument>
  getTicketByIdOptionalAsync: (ticketId: string) => Promise<sockbase.SockbaseTicketDocument | null>
  deleteTicketAsync: (ticketHashId: string) => Promise<void>
  getTicketMetaByIdAsync: (ticketId: string) => Promise<sockbase.SockbaseTicketMeta>
  getTicketUserByHashIdAsync: (ticketHashId: string) => Promise<sockbase.SockbaseTicketUserDocument>
  getTicketUserByHashIdOptionalAsync: (ticketHashId: string) => Promise<sockbase.SockbaseTicketUserDocument | null>
  getTicketUsedStatusByIdAsync: (ticketId: string) => Promise<sockbase.SockbaseTicketUsedStatus>
  updateTicketApplicationStatusAsync: (appId: string, status: sockbase.SockbaseApplicationStatus) => Promise<void>
  updateTicketUsedStatusByIdAsync: (ticketId: string, used: boolean) => Promise<void>
  getTicketsByUserIdAsync: (userId: string) => Promise<sockbase.SockbaseTicketDocument[]>
  getTicketsByStoreIdAsync: (storeId: string) => Promise<sockbase.SockbaseTicketDocument[]>
  getMyTicketsAsync: () => Promise<sockbase.SockbaseTicketDocument[] | undefined>
  getUsableTicketsAsync: () => Promise<sockbase.SockbaseTicketUserDocument[] | undefined>
  assignTicketUserAsync: (userId: string, ticketHashId: string) => Promise<void>
  unassignTicketUserAsync: (ticketHashId: string) => Promise<void>
  exportCSV: (
    tickets: sockbase.SockbaseTicketDocument[],
    ticketUsers: Record<string, sockbase.SockbaseTicketUserDocument>,
    usableUsers: Record<string, sockbase.SockbaseAccount | null>
  ) => string
}

const useStore = (): IUseStore => {
  const { getFirestore, getFunctions, user } = useFirebase()

  const getStoreByIdAsync = async (
    storeId: string
  ): Promise<sockbase.SockbaseStoreDocument> => {
    const db = getFirestore()
    const storeRef = FirestoreDB.doc(db, 'stores', storeId)
      .withConverter(storeConverter)

    const storeDoc = await FirestoreDB.getDoc(storeRef)
    if (!storeDoc.exists()) {
      throw new Error('store not found')
    }

    return storeDoc.data()
  }

  const getStoreByIdOptionalAsync = async (
    storeId: string
  ): Promise<sockbase.SockbaseStoreDocument | null> =>
    await getStoreByIdAsync(storeId)
      .then((store) => store)
      .catch(() => null)

  const getStoresByOrganizationIdAsync = async (organizationId: string): Promise<sockbase.SockbaseStoreDocument[]> => {
    const db = getFirestore()
    const storesRef = FirestoreDB.collection(db, 'stores')
      .withConverter(storeConverter)
    const storesQuery = FirestoreDB.query(
      storesRef,
      FirestoreDB.where('_organization.id', '==', organizationId))
    const storesSnapshot = await FirestoreDB.getDocs(storesQuery)
    const queryDocs = storesSnapshot.docs
      .filter(doc => doc.exists())
      .map(doc => doc.data())
    return queryDocs
  }

  const createStoreAsync = async (storeId: string, store: sockbase.SockbaseStore): Promise<void> => {
    const db = getFirestore()
    const storeRef = FirestoreDB.doc(db, `/stores/${storeId}`)
      .withConverter(storeConverter)
    await FirestoreDB.setDoc(storeRef, store)
      .catch(err => { throw err })
  }

  const createTicketAsync = async (
    ticket: sockbase.SockbaseTicket
  ): Promise<sockbase.SockbaseTicketAddedResult> => {
    const functions = getFunctions()
    const createTicketFunction = FirebaseFunctions.httpsCallable<
      sockbase.SockbaseTicket,
      sockbase.SockbaseTicketAddedResult
    >(functions, 'store-createTicket')

    const appResult = await createTicketFunction(ticket)
    return appResult.data
  }

  const createTicketForAdminAsync = async (
    storeId: string,
    createTicketData: { email: string, typeId: string }
  ): Promise<sockbase.SockbaseTicketCreatedResult> => {
    const funcstions = getFunctions()
    const createTicketForAdminFunction = FirebaseFunctions.httpsCallable<
      { storeId: string, createTicketData: { email: string, typeId: string } },
      sockbase.SockbaseTicketCreatedResult
    >(funcstions, 'store-createTicketForAdmin')

    const ticketResult = await createTicketForAdminFunction({
      storeId,
      createTicketData
    })
    return ticketResult.data
  }

  const getTicketIdByHashIdAsync = async (
    ticketHashId: string
  ): Promise<sockbase.SockbaseTicketHashIdDocument> => {
    const db = getFirestore()
    const ticketHashRef = FirestoreDB.doc(db, '_ticketHashIds', ticketHashId)
      .withConverter(ticketHashIdConverter)
    const ticketHashDoc = await FirestoreDB.getDoc(ticketHashRef)
    const ticketHash = ticketHashDoc.data()
    if (!ticketHash) {
      throw new Error('ticketHash not found')
    }

    return ticketHash
  }

  const getTicketByIdAsync = async (
    ticketId: string
  ): Promise<sockbase.SockbaseTicketDocument> => {
    const db = getFirestore()
    const ticketRef = FirestoreDB.doc(db, '_tickets', ticketId)
      .withConverter(ticketConverter)

    const ticketDoc = await FirestoreDB.getDoc(ticketRef)
    if (!ticketDoc.exists()) {
      throw new Error('store not found')
    }

    return ticketDoc.data()
  }

  const getTicketByIdOptionalAsync = async (ticketId: string): Promise<sockbase.SockbaseTicketDocument | null> =>
    await getTicketByIdAsync(ticketId)
      .catch((err: Error) => {
        console.error(err)
        return null
      })

  const deleteTicketAsync = async (ticketHashId: string): Promise<void> => {
    const ticketHash = await getTicketIdByHashIdAsync(ticketHashId)
      .catch(err => { throw err })

    const db = getFirestore()
    const ticketMetaRef = FirestoreDB.doc(db, `_tickets/${ticketHash.ticketId}/private/meta`)
    const ticketUsedStatusRef = FirestoreDB.doc(db, `_tickets/${ticketHash.ticketId}/private/usedStatus`)
    const ticketRef = FirestoreDB.doc(db, `_tickets/${ticketHash.ticketId}`)
    const ticketUserRef = FirestoreDB.doc(db, `_ticketUsers/${ticketHash.hashId}`)
    const ticketHashRef = FirestoreDB.doc(db, `_ticketHashIds/${ticketHash.hashId}`)
    const paymentRef = (ticketHash.paymentId && FirestoreDB.doc(db, `_payments/${ticketHash.paymentId}`)) || null

    await FirestoreDB.runTransaction(db, async (transaction) => {
      transaction.delete(ticketMetaRef)
      transaction.delete(ticketUsedStatusRef)
      transaction.delete(ticketRef)
      transaction.delete(ticketUserRef)
      transaction.delete(ticketHashRef)

      if (paymentRef) {
        transaction.delete(paymentRef)
      }
    })
      .catch(err => { throw err })
  }

  const getTicketMetaByIdAsync = async (
    ticketId: string
  ): Promise<sockbase.SockbaseTicketMeta> => {
    const db = getFirestore()
    const ticketMetaRef = FirestoreDB.doc(db, `/_tickets/${ticketId}/private/meta`)
      .withConverter(ticketMetaConverter)

    const ticketMetaDoc = await FirestoreDB.getDoc(ticketMetaRef)
    const ticketMeta = ticketMetaDoc.data()
    if (!ticketMeta) {
      throw new Error('ticketMeta not found')
    }

    return ticketMeta
  }

  const getTicketUserByHashIdAsync = async (
    ticketHashId: string
  ): Promise<sockbase.SockbaseTicketUserDocument> => {
    const db = getFirestore()
    const ticketUserRef = FirestoreDB.doc(db, `/_ticketUsers/${ticketHashId}`)
      .withConverter(ticketUserConverter)

    const ticketUserDoc = await FirestoreDB.getDoc(ticketUserRef)
    const ticketUser = ticketUserDoc.data()
    if (!ticketUser) {
      throw new Error('ticketUser not found')
    }

    return ticketUser
  }

  const getTicketUserByHashIdOptionalAsync = async (
    ticketHashId: string
  ): Promise<sockbase.SockbaseTicketUserDocument | null> =>
    await getTicketUserByHashIdAsync(ticketHashId).catch(() => null)

  const getTicketUsedStatusByIdAsync = async (
    ticketId: string
  ): Promise<sockbase.SockbaseTicketUsedStatus> => {
    const db = getFirestore()
    const ticketUsedStatusRef = FirestoreDB.doc(db, `/_tickets/${ticketId}/private/usedStatus`)
      .withConverter(ticketUsedStatusConverter)

    const ticketUsedStatusDoc = await FirestoreDB.getDoc(ticketUsedStatusRef)
    const ticketUsedStatus = ticketUsedStatusDoc.data()
    if (!ticketUsedStatus) {
      throw new Error('ticketUsedStatus not found')
    }

    return ticketUsedStatus
  }

  const updateTicketApplicationStatusAsync = async (
    ticketId: string,
    status: sockbase.SockbaseApplicationStatus
  ): Promise<void> => {
    const db = getFirestore()
    const ticketMetaRef = FirestoreDB.doc(db, `/_tickets/${ticketId}/private/meta`)
      .withConverter(ticketMetaConverter)

    await FirestoreDB.setDoc(
      ticketMetaRef,
      { applicationStatus: status },
      { merge: true }
    )
  }

  const updateTicketUsedStatusByIdAsync = async (
    ticketId: string,
    used: boolean
  ): Promise<void> => {
    const db = getFirestore()
    const ticketUsedStatusRef = FirestoreDB.doc(db, `/_tickets/${ticketId}/private/usedStatus`)
      .withConverter(ticketUsedStatusConverter)

    await FirestoreDB.setDoc(
      ticketUsedStatusRef,
      { used },
      { merge: true }
    ).catch((err) => {
      throw err
    })
  }

  const getTicketsByUserIdAsync = async (
    userId: string
  ): Promise<sockbase.SockbaseTicketDocument[]> => {
    const db = getFirestore()
    const ticketsRef = FirestoreDB.collection(db, '_tickets')
      .withConverter(ticketConverter)

    const ticketsQuery = FirestoreDB.query(
      ticketsRef,
      FirestoreDB.where('userId', '==', userId)
    )
    const ticketsSnapshot = await FirestoreDB.getDocs(ticketsQuery)
    const ticketsDocs = ticketsSnapshot.docs
      .filter((doc) => doc.exists())
      .map((doc) => doc.data())

    return ticketsDocs
  }

  const getTicketsByStoreIdAsync = async (
    storeId: string
  ): Promise<sockbase.SockbaseTicketDocument[]> => {
    const db = getFirestore()
    const ticketsRef = FirestoreDB.collection(db, '_tickets')
      .withConverter(ticketConverter)

    const ticketsQuery = FirestoreDB.query(
      ticketsRef,
      FirestoreDB.where('storeId', '==', storeId)
    )
    const ticketsSnapshot = await FirestoreDB.getDocs(ticketsQuery)
    const ticketsDocs = ticketsSnapshot.docs
      .filter((doc) => doc.exists())
      .map((doc) => doc.data())

    return ticketsDocs
  }

  const getMyTicketsAsync = useCallback(async (): Promise<
  sockbase.SockbaseTicketDocument[] | undefined
  > => {
    if (!user) return
    return await getTicketsByUserIdAsync(user.uid)
  }, [user])

  const getUsableTicketsAsync = useCallback(async (): Promise<
  sockbase.SockbaseTicketUserDocument[] | undefined
  > => {
    if (!user) return

    const db = getFirestore()
    const ticketUsersRef = FirestoreDB.collection(db, '_ticketUsers')
      .withConverter(ticketUserConverter)

    const ticketUsersQuery = FirestoreDB.query(
      ticketUsersRef,
      FirestoreDB.where('usableUserId', '==', user.uid)
    )
    const ticketUsersSnapshot = await FirestoreDB.getDocs(ticketUsersQuery)
    const ticketUsersDocs = ticketUsersSnapshot.docs
      .filter((doc) => doc.exists())
      .map((doc) => doc.data())

    return ticketUsersDocs
  }, [user])

  const assignTicketUserAsync = async (
    userId: string,
    ticketHashId: string
  ): Promise<void> => {
    const db = getFirestore()
    const ticketUserRef = FirestoreDB.doc(db, `/_ticketUsers/${ticketHashId}`)
      .withConverter(ticketUserConverter)

    await FirestoreDB.setDoc(
      ticketUserRef,
      { usableUserId: userId },
      { merge: true }
    )
  }

  const unassignTicketUserAsync = async (
    ticketHashId: string
  ): Promise<void> => {
    const db = getFirestore()
    const ticketUserRef = FirestoreDB.doc(db, `/_ticketUsers/${ticketHashId}`)
      .withConverter(ticketUserConverter)

    await FirestoreDB.setDoc(
      ticketUserRef,
      { usableUserId: null },
      { merge: true }
    )
  }

  const exportCSV = (
    tickets: sockbase.SockbaseTicketDocument[],
    ticketUsers: Record<string, sockbase.SockbaseTicketUserDocument>,
    usableUsers: Record<string, sockbase.SockbaseAccount | null>
  ): string => {
    const headers = 'hashId,type,name,postalCode,address,telephone'
    return [
      headers,
      ...tickets.map((t) => {
        const usableUserId = t.hashId && ticketUsers[t.hashId].usableUserId

        return [
          t.hashId,
          t.typeId,
          (usableUserId && usableUsers[usableUserId]?.name) ?? '未入力',
          (usableUserId && usableUsers[usableUserId]?.postalCode) ?? '未入力',
          (usableUserId && usableUsers[usableUserId]?.address) ?? '未入力',
          (usableUserId && usableUsers[usableUserId]?.telephone) ?? '未入力'
        ].join(',')
      })
    ].join('\n')
  }

  return {
    getStoreByIdAsync,
    getStoreByIdOptionalAsync,
    getStoresByOrganizationIdAsync,
    createStoreAsync,
    createTicketAsync,
    createTicketForAdminAsync,
    getTicketIdByHashIdAsync,
    getTicketByIdAsync,
    getTicketByIdOptionalAsync,
    deleteTicketAsync,
    getTicketMetaByIdAsync,
    getTicketUserByHashIdAsync,
    getTicketUserByHashIdOptionalAsync,
    getTicketUsedStatusByIdAsync,
    updateTicketApplicationStatusAsync,
    updateTicketUsedStatusByIdAsync,
    getTicketsByUserIdAsync,
    getTicketsByStoreIdAsync,
    getMyTicketsAsync,
    getUsableTicketsAsync,
    assignTicketUserAsync,
    unassignTicketUserAsync,
    exportCSV
  }
}

export default useStore
