import { useCallback } from 'react'
import * as FirestoreDB from 'firebase/firestore'
import * as FirebaseFunctions from 'firebase/functions'
import * as FirebaseStorage from 'firebase/storage'
import {
  eventConverter,
  spaceConverter
} from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseEvent, SockbaseEventDocument, SockbaseSpaceDocument } from 'sockbase'

interface IUseEvent {
  getEventByIdAsync: (eventId: string) => Promise<SockbaseEventDocument>
  getEventsByOrganizationIdAsync: (organizationId: string) => Promise<SockbaseEventDocument[]>
  getEventEyecatchAsync: (eventId: string) => Promise<string | null>
  getSpaceAsync: (spaceId: string) => Promise<SockbaseSpaceDocument>
  getSpaceOptionalAsync: (spaceId: string) => Promise<SockbaseSpaceDocument | null>
  getSpacesByEventIdAsync: (eventId: string) => Promise<SockbaseSpaceDocument[]>
  createEventAsync: (eventId: string, event: SockbaseEvent) => Promise<void>
  uploadEventEyecatchAsync: (eventId: string, eyecatchFile: File) => Promise<void>
  createPassesAsync: (eventId: string) => Promise<number>
}

const useEvent = (): IUseEvent => {
  const { getFirestore, getStorage, getFunctions } = useFirebase()

  const getEventByIdAsync = async (eventId: string): Promise<SockbaseEventDocument> => {
    const db = getFirestore()
    const eventRef = FirestoreDB.doc(db, 'events', eventId)
      .withConverter(eventConverter)

    const eventDoc = await FirestoreDB.getDoc(eventRef)
    if (!eventDoc.exists()) {
      throw new Error('event not found')
    }

    return eventDoc.data()
  }

  const getEventsByOrganizationIdAsync = useCallback(async (organizationId: string): Promise<SockbaseEventDocument[]> => {
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

  const getEventEyecatchAsync = async (eventId: string): Promise<string | null> => {
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

  const getSpaceAsync = async (
    spaceId: string
  ): Promise<SockbaseSpaceDocument> => {
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

  const getSpaceOptionalAsync = async (
    spaceId: string
  ): Promise<SockbaseSpaceDocument | null> => {
    return await getSpaceAsync(spaceId).catch(() => null)
  }

  const getSpacesByEventIdAsync = async (eventId: string): Promise<SockbaseSpaceDocument[]> => {
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

  const createEventAsync = async (eventId: string, event: SockbaseEvent): Promise<void> => {
    const db = getFirestore()
    const eventRef = FirestoreDB.doc(db, `/events/${eventId}`)
      .withConverter(eventConverter)
    await FirestoreDB.setDoc(eventRef, event)
      .catch(err => { throw err })
  }

  const uploadEventEyecatchAsync = async (eventId: string, eyecatchFile: File): Promise<void> => {
    const storage = getStorage()
    const eyecatchRef = FirebaseStorage.ref(storage, `events/${eventId}/eyecatch.jpg`)
    await FirebaseStorage.uploadBytes(eyecatchRef, eyecatchFile)
  }

  const createPassesAsync = async (eventId: string): Promise<number> => {
    const functions = getFunctions()
    const createPassesFunction = FirebaseFunctions
      .httpsCallable<string, number>(
      functions,
      'event-createPasses')
    const createResult = await createPassesFunction(eventId)
    return createResult.data
  }

  return {
    getEventByIdAsync,
    getEventsByOrganizationIdAsync,
    getEventEyecatchAsync,
    getSpaceAsync,
    getSpaceOptionalAsync,
    getSpacesByEventIdAsync,
    createEventAsync,
    uploadEventEyecatchAsync,
    createPassesAsync
  }
}

export default useEvent
