import { useCallback } from 'react'
import * as FirestoreDB from 'firebase/firestore'
import * as FirebaseStorage from 'firebase/storage'
import {
  docLinkConverter,
  eventConverter,
  spaceConverter
} from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseDocLinkDocument, SockbaseEventDocument, SockbaseSpaceDocument } from 'sockbase'

interface IUseEvent {
  getEventByIdAsync: (eventId: string) => Promise<SockbaseEventDocument>
  getEventsByOrganizationIdAsync: (organizationId: string) => Promise<SockbaseEventDocument[]>
  getEventEyecatchAsync: (eventId: string) => Promise<string | null>
  getSpaceAsync: (spaceId: string) => Promise<SockbaseSpaceDocument>
  getSpaceOptionalAsync: (spaceId: string) => Promise<SockbaseSpaceDocument | null>
  getSpacesByEventIdAsync: (eventId: string) => Promise<SockbaseSpaceDocument[]>
  getDocLinksByEventIdAsync: (eventId: string) => Promise<SockbaseDocLinkDocument[]>
}

const useEvent = (): IUseEvent => {
  const { getFirestore, getStorage } = useFirebase()

  const getEventByIdAsync =
    async (eventId: string): Promise<SockbaseEventDocument> => {
      const db = getFirestore()
      const eventRef = FirestoreDB.doc(db, 'events', eventId)
        .withConverter(eventConverter)

      const eventDoc = await FirestoreDB.getDoc(eventRef)
      if (!eventDoc.exists()) {
        throw new Error('event not found')
      }

      return eventDoc.data()
    }

  const getEventsByOrganizationIdAsync =
    useCallback(async (organizationId: string): Promise<SockbaseEventDocument[]> => {
      const db = getFirestore()
      const eventsRef = FirestoreDB.collection(db, 'events')
        .withConverter(eventConverter)
      const eventsQuery = FirestoreDB.query(
        eventsRef,
        FirestoreDB.where('_organization.id', '==', organizationId))
      const eventsSnapshot = await FirestoreDB.getDocs(eventsQuery)
      const queryDocs = eventsSnapshot.docs
        .filter(doc => doc.exists())
        .map(doc => doc.data())
      return queryDocs
    }, [])

  const getEventEyecatchAsync =
    async (eventId: string): Promise<string | null> => {
      const storage = getStorage()
      const eyecatchRef = FirebaseStorage.ref(
        storage,
        `/events/${eventId}/eyecatch.jpg`
      )
      const eyecatchURL = await FirebaseStorage.getDownloadURL(eyecatchRef).catch(
        () => null
      )
      return eyecatchURL
    }

  const getSpaceAsync =
    async (spaceId: string): Promise<SockbaseSpaceDocument> => {
      const db = getFirestore()
      const spaceRef = FirestoreDB.doc(db, `spaces/${spaceId}`).withConverter(
        spaceConverter
      )
      const spaceDoc = await FirestoreDB.getDoc(spaceRef)
      const space = spaceDoc.data()
      if (!space) {
        throw new Error('space not found')
      }
      return space
    }

  const getSpaceOptionalAsync =
    async (spaceId: string): Promise<SockbaseSpaceDocument | null> =>
      await getSpaceAsync(spaceId).catch(() => null)

  const getSpacesByEventIdAsync =
    async (eventId: string): Promise<SockbaseSpaceDocument[]> => {
      const db = getFirestore()

      const spaceHashesRef = FirestoreDB.collection(db, '_spaceHashes')
        .withConverter(spaceConverter)
      const spaceHashesQuery = FirestoreDB
        .query(spaceHashesRef, FirestoreDB.where('eventId', '==', eventId))

      const spaceHashesSnapshot = await FirestoreDB.getDocs(spaceHashesQuery)
        .catch(err => { throw err })

      const queryDocs = await Promise.all(spaceHashesSnapshot.docs
        .filter(doc => doc.exists())
        .map(doc => doc.data())
        .map(async spaceHash => await getSpaceAsync(spaceHash.id)))
        .then(fetchedSpaces => fetchedSpaces
          .sort((a, b) => a.spaceOrder - b.spaceOrder)
          .sort((a, b) => a.spaceGroupOrder - b.spaceGroupOrder))

      return queryDocs
    }

  const getDocLinksByEventIdAsync = useCallback(async (eventId: string): Promise<SockbaseDocLinkDocument[]> => {
    const db = getFirestore()
    const docLinksRef = FirestoreDB.collection(db, 'events', eventId, 'docLinks')
      .withConverter(docLinkConverter)
    const docLinksQuery = FirestoreDB.query(docLinksRef, FirestoreDB.where('eventId', '==', eventId))
    const docLinksSnapshot = await FirestoreDB.getDocs(docLinksQuery)
    const queryDocs = docLinksSnapshot.docs
      .filter(doc => doc.exists())
      .map(doc => doc.data())
    return queryDocs
  }, [])

  return {
    getEventByIdAsync,
    getEventsByOrganizationIdAsync,
    getEventEyecatchAsync,
    getSpaceAsync,
    getSpaceOptionalAsync,
    getSpacesByEventIdAsync,
    getDocLinksByEventIdAsync
  }
}

export default useEvent
