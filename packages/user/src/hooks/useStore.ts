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
import type {
  SockbaseStoreDocument,
  SockbaseTicket,
  SockbaseTicketAddedResult,
  SockbaseTicketHashIdDocument,
  SockbaseTicketDocument,
  SockbaseTicketMeta,
  SockbaseTicketUserDocument,
  SockbaseTicketUsedStatus,
  SockbaseAccount
} from 'sockbase'

interface IUseStore {
  getStoreByIdAsync: (storeId: string) => Promise<SockbaseStoreDocument>
  getStoreByIdOptionalAsync: (storeId: string) => Promise<SockbaseStoreDocument | null>
  getStoresByOrganizationIdAsync: (organizationId: string) => Promise<SockbaseStoreDocument[]>
  createTicketAsync: (ticket: SockbaseTicket) => Promise<SockbaseTicketAddedResult>
  getTicketIdByHashIdAsync: (ticketHashId: string) => Promise<SockbaseTicketHashIdDocument>
  getTicketIdByHashIdNullableAsync: (ticketHashId: string) => Promise<SockbaseTicketHashIdDocument | null>
  getTicketByIdAsync: (ticketId: string) => Promise<SockbaseTicketDocument>
  getTicketByIdOptionalAsync: (ticketId: string) => Promise<SockbaseTicketDocument | null>
  getTicketMetaByIdAsync: (ticketId: string) => Promise<SockbaseTicketMeta>
  getTicketUserByHashIdAsync: (ticketHashId: string) => Promise<SockbaseTicketUserDocument>
  getTicketUserByHashIdNullableAsync: (ticketHashId: string) => Promise<SockbaseTicketUserDocument | null>
  getTicketUsedStatusByIdAsync: (ticketId: string) => Promise<SockbaseTicketUsedStatus>
  updateTicketUsedStatusByIdAsync: (ticketId: string, used: boolean) => Promise<void>
  getTicketsByUserIdAsync: (userId: string) => Promise<SockbaseTicketDocument[]>
  getTicketsByStoreIdAsync: (storeId: string) => Promise<SockbaseTicketDocument[]>
  getMyTicketsAsync: () => Promise<SockbaseTicketDocument[] | undefined>
  getUsableTicketsAsync: () => Promise<SockbaseTicketUserDocument[] | undefined>
  assignTicketUserAsync: (userId: string, ticketHashId: string) => Promise<void>
  unassignTicketUserAsync: (ticketHashId: string) => Promise<void>
  exportCSV: (
    tickets: SockbaseTicketDocument[],
    ticketUsers: Record<string, SockbaseTicketUserDocument>,
    usableUsers: Record<string, SockbaseAccount | null>
  ) => string
}

const useStore = (): IUseStore => {
  const { getFirestore, getFunctions, user } = useFirebase()

  const getStoreByIdAsync =
    async (storeId: string): Promise<SockbaseStoreDocument> => {
      const db = getFirestore()
      const storeRef = FirestoreDB.doc(db, 'stores', storeId)
        .withConverter(storeConverter)

      const storeDoc = await FirestoreDB.getDoc(storeRef)
      if (!storeDoc.exists()) {
        throw new Error('store not found')
      }

      return storeDoc.data()
    }

  const getStoreByIdOptionalAsync =
    async (storeId: string): Promise<SockbaseStoreDocument | null> =>
      await getStoreByIdAsync(storeId)
        .then(store => store)
        .catch(() => null)

  const getStoresByOrganizationIdAsync =
    async (organizationId: string): Promise<SockbaseStoreDocument[]> => {
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

  const createTicketAsync =
    async (ticket: SockbaseTicket): Promise<SockbaseTicketAddedResult> => {
      const functions = getFunctions()
      const createTicketFunction = FirebaseFunctions.httpsCallable<
        SockbaseTicket,
        SockbaseTicketAddedResult
      >(functions, 'store-createTicket')

      const appResult = await createTicketFunction(ticket)
      return appResult.data
    }

  const getTicketIdByHashIdAsync =
    async (ticketHashId: string): Promise<SockbaseTicketHashIdDocument> => {
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

  const getTicketIdByHashIdNullableAsync =
    async (ticketHashId: string): Promise<SockbaseTicketHashIdDocument | null> =>
      await getTicketIdByHashIdAsync(ticketHashId)
        .catch(err => {
          console.error(err)
          return null
        })

  const getTicketByIdAsync =
    async (ticketId: string): Promise<SockbaseTicketDocument> => {
      const db = getFirestore()
      const ticketRef = FirestoreDB.doc(db, '_tickets', ticketId)
        .withConverter(ticketConverter)

      const ticketDoc = await FirestoreDB.getDoc(ticketRef)
      if (!ticketDoc.exists()) {
        throw new Error('store not found')
      }

      return ticketDoc.data()
    }

  const getTicketByIdOptionalAsync =
    async (ticketId: string): Promise<SockbaseTicketDocument | null> =>
      await getTicketByIdAsync(ticketId)
        .catch((err: Error) => {
          console.error(err)
          return null
        })

  const getTicketMetaByIdAsync =
    async (ticketId: string): Promise<SockbaseTicketMeta> => {
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

  const getTicketUserByHashIdAsync =
    async (ticketHashId: string): Promise<SockbaseTicketUserDocument> => {
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

  const getTicketUserByHashIdNullableAsync =
    async (ticketHashId: string): Promise<SockbaseTicketUserDocument | null> =>
      await getTicketUserByHashIdAsync(ticketHashId).catch(() => null)

  const getTicketUsedStatusByIdAsync =
    async (ticketId: string): Promise<SockbaseTicketUsedStatus> => {
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

  const updateTicketUsedStatusByIdAsync =
    async (ticketId: string, used: boolean): Promise<void> => {
      const db = getFirestore()
      const ticketUsedStatusRef = FirestoreDB.doc(db, `/_tickets/${ticketId}/private/usedStatus`)
        .withConverter(ticketUsedStatusConverter)

      await FirestoreDB.setDoc(
        ticketUsedStatusRef,
        { used },
        { merge: true })
        .catch(err => { throw err })
    }

  const getTicketsByUserIdAsync =
    async (userId: string): Promise<SockbaseTicketDocument[]> => {
      const db = getFirestore()
      const ticketsRef = FirestoreDB.collection(db, '_tickets')
        .withConverter(ticketConverter)

      const ticketsQuery = FirestoreDB.query(
        ticketsRef,
        FirestoreDB.where('userId', '==', userId)
      )
      const ticketsSnapshot = await FirestoreDB.getDocs(ticketsQuery)
      const ticketsDocs = ticketsSnapshot.docs
        .filter(doc => doc.exists())
        .map(doc => doc.data())

      return ticketsDocs
    }

  const getTicketsByStoreIdAsync =
    async (storeId: string): Promise<SockbaseTicketDocument[]> => {
      const db = getFirestore()
      const ticketsRef = FirestoreDB.collection(db, '_tickets')
        .withConverter(ticketConverter)

      const ticketsQuery = FirestoreDB.query(
        ticketsRef,
        FirestoreDB.where('storeId', '==', storeId)
      )
      const ticketsSnapshot = await FirestoreDB.getDocs(ticketsQuery)
      const ticketsDocs = ticketsSnapshot.docs
        .filter(doc => doc.exists())
        .map(doc => doc.data())

      return ticketsDocs
    }

  const getMyTicketsAsync =
    useCallback(async (): Promise<SockbaseTicketDocument[] | undefined> => {
      if (!user) return
      return await getTicketsByUserIdAsync(user.uid)
    }, [user])

  const getUsableTicketsAsync =
    useCallback(async (): Promise<SockbaseTicketUserDocument[] | undefined> => {
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
        .filter(doc => doc.exists())
        .map(doc => doc.data())

      return ticketUsersDocs
    }, [user])

  const assignTicketUserAsync =
    async (userId: string, ticketHashId: string): Promise<void> => {
      const db = getFirestore()
      const ticketUserRef = FirestoreDB.doc(db, `/_ticketUsers/${ticketHashId}`)
        .withConverter(ticketUserConverter)

      await FirestoreDB.setDoc(
        ticketUserRef,
        { usableUserId: userId },
        { merge: true })
    }

  const unassignTicketUserAsync =
    async (ticketHashId: string): Promise<void> => {
      const db = getFirestore()
      const ticketUserRef = FirestoreDB.doc(db, `/_ticketUsers/${ticketHashId}`)
        .withConverter(ticketUserConverter)

      await FirestoreDB.setDoc(
        ticketUserRef,
        { usableUserId: null },
        { merge: true })
    }

  const exportCSV = (
    tickets: SockbaseTicketDocument[],
    ticketUsers: Record<string, SockbaseTicketUserDocument>,
    usableUsers: Record<string, SockbaseAccount | null>
  ): string => {
    const headers = 'hashId,type,name,postalCode,address,telephone'
    return [
      headers,
      ...tickets.map(t => {
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
    createTicketAsync,
    getTicketIdByHashIdAsync,
    getTicketIdByHashIdNullableAsync,
    getTicketByIdAsync,
    getTicketByIdOptionalAsync,
    getTicketMetaByIdAsync,
    getTicketUserByHashIdAsync,
    getTicketUserByHashIdNullableAsync,
    getTicketUsedStatusByIdAsync,
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
