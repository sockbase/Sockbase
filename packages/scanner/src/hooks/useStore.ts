import { useCallback } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { ticketHashIdConverter, ticketMetaConverter, ticketUsedStatusConverter, ticketUserConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseTicketHashIdDocument, SockbaseTicketMeta, SockbaseTicketUsedStatus, SockbaseTicketUserDocument } from 'sockbase'

interface IUseStore {
  getTicketUserByHashIdAsync: (ticketHashId: string) => Promise<SockbaseTicketUserDocument>
  getTicketUserByHashIdNullableAsync: (ticketHashId: string) => Promise<SockbaseTicketUserDocument | null>
  getTicketHashAsync: (ticketHashId: string) => Promise<SockbaseTicketHashIdDocument>
  getTicketUsedStatusByIdAsync: (ticketId: string) => Promise<SockbaseTicketUsedStatus>
  getTicketMetaByIdAsync: (ticketId: string) => Promise<SockbaseTicketMeta>
  updateTicketUsedStatusByIdAsync: (ticketId: string, used: boolean) => Promise<void>
}

const useStore = (): IUseStore => {
  const { getFirestore } = useFirebase()
  const db = getFirestore()

  const getTicketUserByHashIdAsync =
    useCallback(async (ticketHashId: string): Promise<SockbaseTicketUserDocument> => {
      const ticketUserRef = doc(db, '_ticketUsers', ticketHashId)
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

  const getTicketHashAsync =
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

  const getTicketUsedStatusByIdAsync =
    useCallback(async (ticketId: string): Promise<SockbaseTicketUsedStatus> => {
      const ticketUsedStatusRef = doc(db, '_tickets', ticketId, 'private', 'usedStatus')
        .withConverter(ticketUsedStatusConverter)
      const ticketUsedStatusDoc = await getDoc(ticketUsedStatusRef)
      const ticketUsedStatus = ticketUsedStatusDoc.data()
      if (!ticketUsedStatus) {
        throw new Error('ticketUsedStatus not found')
      }
      return ticketUsedStatus
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

  const updateTicketUsedStatusByIdAsync =
    useCallback(async (ticketId: string, used: boolean) => {
      const ticketUsedStatusRef = doc(db, '_tickets', ticketId, 'private', 'usedStatus')
        .withConverter(ticketUsedStatusConverter)

      await setDoc(
        ticketUsedStatusRef,
        { used },
        { merge: true })
        .catch(err => { throw err })
    }, [])

  return {
    getTicketUserByHashIdAsync,
    getTicketUserByHashIdNullableAsync,
    getTicketHashAsync,
    getTicketUsedStatusByIdAsync,
    getTicketMetaByIdAsync,
    updateTicketUsedStatusByIdAsync
  }
}

export default useStore
