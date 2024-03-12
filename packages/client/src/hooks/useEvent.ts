import type { SockbaseEvent, SockbaseEventDocument, SockbaseSpaceDocument, SockbaseSpaceHash } from 'sockbase'
import { type RawAssignEventSpace, type RawEventSpace } from '../@types'
import * as FirestoreDB from 'firebase/firestore'
import * as FirebaseStorage from 'firebase/storage'
import useFirebase from './useFirebase'
import {
  applicationHashIdConverter,
  eventConverter,
  spaceConverter
} from '../libs/converters'
import { useCallback } from 'react'

interface IUseEvent {
  getEventByIdAsync: (eventId: string) => Promise<SockbaseEvent>
  getEventsByOrganizationId: (organizationId: string) => Promise<SockbaseEventDocument[]>
  getEventEyecatch: (eventId: string) => Promise<string | null>
  getSpaceAsync: (spaceId: string) => Promise<SockbaseSpaceDocument>
  getSpaceOptionalAsync: (spaceId: string) => Promise<SockbaseSpaceDocument | null>
  getSpacesByEventIdAsync: (eventId: string) => Promise<SockbaseSpaceDocument[]>
  createSpacesAsync: (eventId: string, rawSpaces: RawEventSpace[]) => Promise<SockbaseSpaceDocument[]>
  assignSpacesAsync: (rawAssignSpaces: RawAssignEventSpace[]) => Promise<void>
}

const useEvent = (): IUseEvent => {
  const { getFirestore, getStorage } = useFirebase()

  const getEventByIdAsync = async (eventId: string): Promise<SockbaseEvent> => {
    const db = getFirestore()
    const eventRef = FirestoreDB.doc(db, 'events', eventId).withConverter(
      eventConverter
    )

    const eventDoc = await FirestoreDB.getDoc(eventRef)
    if (!eventDoc.exists()) {
      throw new Error('event not found')
    }

    return eventDoc.data()
  }

  const getEventsByOrganizationId = useCallback(async (organizationId: string): Promise<SockbaseEventDocument[]> => {
    const db = getFirestore()
    const eventsRef = FirestoreDB.collection(db, 'events')
      .withConverter(eventConverter)
    const eventsQuery = FirestoreDB.query(eventsRef, FirestoreDB.where('_organization.id', '==', organizationId))
    const eventsSnapshot = await FirestoreDB.getDocs(eventsQuery)
    const queryDocs = eventsSnapshot.docs
      .filter(doc => doc.exists())
      .map(doc => doc.data())
    return queryDocs
  }, [])

  const getEventEyecatch = async (eventId: string): Promise<string | null> => {
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

  const createSpacesAsync = async (
    eventId: string,
    rawSpaces: RawEventSpace[]
  ): Promise<SockbaseSpaceDocument[]> => {
    const db = getFirestore()
    const spacesRef = FirestoreDB.collection(db, 'spaces').withConverter(
      spaceConverter
    )

    const addResults = await Promise.all(
      rawSpaces.map(async (space) => {
        const spaceDoc: SockbaseSpaceDocument = {
          ...space,
          id: '',
          eventId
        }

        const addResult = await FirestoreDB
          .addDoc(spacesRef, spaceDoc)
          .catch(err => { throw err })

        const spaceId = addResult.id
        const spaceHashRef = FirestoreDB.doc(db, `_spaceHashes/${spaceId}`)
        const spaceHashDoc: SockbaseSpaceHash = {
          eventId
        }

        await FirestoreDB
          .setDoc(spaceHashRef, spaceHashDoc)
          .catch(err => { throw err })

        return {
          ...spaceDoc,
          id: addResult.id
        }
      }))
      .catch(err => { throw err })

    return addResults
  }

  const assignSpacesAsync = async (
    rawAssignSpaces: RawAssignEventSpace[]
  ): Promise<void> => {
    const db = getFirestore()
    const batch = FirestoreDB.writeBatch(db)

    rawAssignSpaces.forEach((space) => {
      const appHashDocRef = FirestoreDB.doc(db, `/_applicationHashIds/${space.applicationHashId}`)
        .withConverter(applicationHashIdConverter)
      batch.set(
        appHashDocRef,
        {
          spaceId: space.spaceId
        },
        { merge: true }
      )
    })

    await batch.commit().catch((err) => {
      throw err
    })
  }

  return {
    getEventByIdAsync,
    getEventsByOrganizationId,
    getEventEyecatch,
    getSpaceAsync,
    getSpaceOptionalAsync,
    getSpacesByEventIdAsync,
    createSpacesAsync,
    assignSpacesAsync
  }
}

export default useEvent
