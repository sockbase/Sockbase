import { useCallback } from 'react'
import { collection, query, where, getDocs, doc, getDoc, setDoc, runTransaction } from 'firebase/firestore'
import { storeConverter, ticketConverter, ticketHashIdConverter, ticketMetaConverter, ticketUsedStatusConverter, ticketUserConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseApplicationStatus, SockbaseStoreDocument, SockbaseTicketDocument, SockbaseTicketHashIdDocument, SockbaseTicketMeta, SockbaseTicketUsedStatus, SockbaseTicketUserDocument } from 'sockbase'

interface IUseStore {
  getStoreByIdAsync: (storeId: string) => Promise<SockbaseStoreDocument>
  getStoresByOrganizationIdAsync: (organizationId: string) => Promise<SockbaseStoreDocument[]>
  getTicketByIdAsync: (ticketId: string) => Promise<SockbaseTicketDocument>
  getTicketIdByHashIdAsync: (ticketHashId: string) => Promise<SockbaseTicketHashIdDocument>
  getTicketsByStoreIdAsync: (storeId: string) => Promise<SockbaseTicketDocument[]>
  getTicketMetaByIdAsync: (ticketId: string) => Promise<SockbaseTicketMeta>
  getTicketUserByHashIdAsync: (ticketHashId: string) => Promise<SockbaseTicketUserDocument>
  getTicketUsedStatusByIdAsync: (ticketId: string) => Promise<SockbaseTicketUsedStatus>
  setTicketApplicationStatusAsync: (ticketId: string, status: SockbaseApplicationStatus) => Promise<void>
  deleteTicketAsync: (ticketHashId: string) => Promise<void>
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

  const getTicketsByStoreIdAsync =
    useCallback(async (storeId: string) => {
      const ticketsRef = collection(db, '_tickets')
        .withConverter(ticketConverter)
      const ticketsQuery = query(ticketsRef, where('storeId', '==', storeId))
      const ticketsSnapshot = await getDocs(ticketsQuery)
      const ticketsDocs = ticketsSnapshot.docs
        .filter((doc) => doc.exists())
        .map((doc) => doc.data())
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
    useCallback(async (ticketId: string, status: SockbaseApplicationStatus): Promise<void> => {
      const db = getFirestore()
      const ticketMetaRef = doc(db, `/_tickets/${ticketId}/private/meta`)
        .withConverter(ticketMetaConverter)

      await setDoc(
        ticketMetaRef,
        { applicationStatus: status },
        { merge: true })
    }, [])

  const deleteTicketAsync =
    useCallback(async (ticketHashId: string): Promise<void> => {
      const ticketHash = await getTicketIdByHashIdAsync(ticketHashId)
        .catch(err => { throw err })

      const db = getFirestore()
      const ticketMetaRef = doc(db, `_tickets/${ticketHash.ticketId}/private/meta`)
      const ticketUsedStatusRef = doc(db, `_tickets/${ticketHash.ticketId}/private/usedStatus`)
      const ticketRef = doc(db, `_tickets/${ticketHash.ticketId}`)
      const ticketUserRef = doc(db, `_ticketUsers/${ticketHash.hashId}`)
      const ticketHashRef = doc(db, `_ticketHashIds/${ticketHash.hashId}`)
      const paymentRef = (ticketHash.paymentId && doc(db, `_payments/${ticketHash.paymentId}`)) || null

      await runTransaction(db, async tx => {
        tx.delete(ticketMetaRef)
        tx.delete(ticketUsedStatusRef)
        tx.delete(ticketRef)
        tx.delete(ticketUserRef)
        tx.delete(ticketHashRef)

        if (paymentRef) {
          tx.delete(paymentRef)
        }
      })
        .catch(err => { throw err })
    }, [])

  return {
    getStoreByIdAsync,
    getStoresByOrganizationIdAsync,
    getTicketByIdAsync,
    getTicketIdByHashIdAsync,
    getTicketsByStoreIdAsync,
    getTicketMetaByIdAsync,
    getTicketUserByHashIdAsync,
    getTicketUsedStatusByIdAsync,
    setTicketApplicationStatusAsync,
    deleteTicketAsync
  }
}

export default useStore