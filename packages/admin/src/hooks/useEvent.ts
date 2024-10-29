import { useCallback } from 'react'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { eventConverter, spaceConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseCirclePassCreatedResult, SockbaseEventDocument, SockbaseSpaceDocument } from 'sockbase'

interface IUseEvent {
  getEventByIdAsync: (eventId: string) => Promise<SockbaseEventDocument>
  getEventsByOrganizationIdAsync: (organizationId: string) => Promise<SockbaseEventDocument[]>
  getSpaceByIdAsync: (spaceId: string) => Promise<SockbaseSpaceDocument>
  getSpaceByIdNullableAsync: (spaceId: string) => Promise<SockbaseSpaceDocument | null>
  getSpacesByEventIdAsync: (eventId: string) => Promise<SockbaseSpaceDocument[]>
  createPassesAsync: (eventId: string) => Promise<SockbaseCirclePassCreatedResult>
}

const useEvent = (): IUseEvent => {
  const { getFirestore, getFunctions } = useFirebase()
  const db = getFirestore()
  const functions = getFunctions()

  const getEventByIdAsync =
    useCallback(async (eventId: string) => {
      const eventRef = doc(db, 'events', eventId)
        .withConverter(eventConverter)

      const eventDoc = await getDoc(eventRef)
      if (!eventDoc.exists()) {
        throw new Error('event not found')
      }

      return eventDoc.data()
    }, [])

  const getEventsByOrganizationIdAsync =
    useCallback(async (organizationId: string) => {
      const eventsRef = collection(db, 'events')
        .withConverter(eventConverter)
      const eventsQuery = query(
        eventsRef,
        where('_organization.id', '==', organizationId))
      const eventsSnapshot = await getDocs(eventsQuery)
      const queryDocs = eventsSnapshot.docs
        .filter(doc => doc.exists())
        .map(doc => doc.data())
      return queryDocs
    }, [])

  const getSpaceByIdAsync =
    useCallback(async (spaceId: string): Promise<SockbaseSpaceDocument> => {
      const spaceRef = doc(db, `spaces/${spaceId}`)
        .withConverter(spaceConverter)
      const spaceDoc = await getDoc(spaceRef)
      const space = spaceDoc.data()
      if (!space) {
        throw new Error('space not found')
      }
      return space
    }, [])

  const getSpaceByIdNullableAsync =
    useCallback(async (spaceId: string): Promise<SockbaseSpaceDocument | null> => {
      return await getSpaceByIdAsync(spaceId)
        .catch(() => null)
    }, [])

  const getSpacesByEventIdAsync =
    useCallback(async (eventId: string): Promise<SockbaseSpaceDocument[]> => {
      const spaceHashesRef = collection(db, '_spaceHashes')
        .withConverter(spaceConverter)
      const spaceHashesQuery = query(spaceHashesRef, where('eventId', '==', eventId))

      const spaceHashesSnapshot = await getDocs(spaceHashesQuery)
        .catch(err => { throw err })

      const queryDocs = await Promise.all(spaceHashesSnapshot.docs
        .filter(doc => doc.exists())
        .map(doc => doc.data())
        .map(async spaceHash => await getSpaceByIdAsync(spaceHash.id)))
        .then(fetchedSpaces => fetchedSpaces
          .sort((a, b) => a.spaceOrder - b.spaceOrder)
          .sort((a, b) => a.spaceGroupOrder - b.spaceGroupOrder))

      return queryDocs
    }, [])

  const createPassesAsync =
  useCallback(async (eventId: string) => {
    const createPassesFunction = httpsCallable<string, SockbaseCirclePassCreatedResult>(
      functions,
      'event-createPasses')
    const createResult = await createPassesFunction(eventId)
    return createResult.data
  }, [])

  return {
    getEventByIdAsync,
    getEventsByOrganizationIdAsync,
    getSpaceByIdAsync,
    getSpaceByIdNullableAsync,
    getSpacesByEventIdAsync,
    createPassesAsync
  }
}

export default useEvent
