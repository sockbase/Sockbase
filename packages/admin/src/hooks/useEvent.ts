import { useCallback } from 'react'
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { ref, uploadBytes } from 'firebase/storage'
import { eventConverter, spaceConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseCirclePassCreatedResult, SockbaseEvent, SockbaseEventDocument, SockbaseSpaceDocument } from 'sockbase'

interface IUseEvent {
  getEventByIdAsync: (eventId: string) => Promise<SockbaseEventDocument>
  getEventsByOrganizationIdAsync: (organizationId: string) => Promise<SockbaseEventDocument[]>
  getSpaceByIdAsync: (spaceId: string) => Promise<SockbaseSpaceDocument>
  getSpaceByIdNullableAsync: (spaceId: string) => Promise<SockbaseSpaceDocument | null>
  getSpacesByEventIdAsync: (eventId: string) => Promise<SockbaseSpaceDocument[]>
  createPassesAsync: (eventId: string) => Promise<SockbaseCirclePassCreatedResult>
  createEventAsync: (eventId: string, event: SockbaseEvent) => Promise<void>
  uploadEventEyecatchAsync: (eventId: string, eyecatchFile: File) => Promise<void>
}

const useEvent = (): IUseEvent => {
  const { getFirestore, getFunctions, getStorage } = useFirebase()
  const db = getFirestore()
  const functions = getFunctions()
  const storage = getStorage()

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

  const createEventAsync =
    useCallback(async (eventId: string, event: SockbaseEvent): Promise<void> => {
      const eventRef = doc(db, `/events/${eventId}`)
        .withConverter(eventConverter)
      await setDoc(eventRef, event)
        .catch(err => { throw err })
    }, [])

  const uploadEventEyecatchAsync =
    useCallback(async (eventId: string, eyecatchFile: File): Promise<void> => {
      const eyecatchRef = ref(storage, `events/${eventId}/eyecatch.jpg`)
      await uploadBytes(eyecatchRef, eyecatchFile)
    }, [])

  return {
    getEventByIdAsync,
    getEventsByOrganizationIdAsync,
    getSpaceByIdAsync,
    getSpaceByIdNullableAsync,
    getSpacesByEventIdAsync,
    createPassesAsync,
    createEventAsync,
    uploadEventEyecatchAsync
  }
}

export default useEvent
