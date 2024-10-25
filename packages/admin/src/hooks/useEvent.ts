import { useCallback } from 'react'
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore'
import { eventConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseEventDocument } from 'sockbase'

interface IUseEvent {
  getEventByIdAsync: (eventId: string) => Promise<SockbaseEventDocument>
  getEventsByOrganizationIdAsync: (organizationId: string) => Promise<SockbaseEventDocument[]>
}

const useEvent = (): IUseEvent => {
  const { getFirestore } = useFirebase()
  const db = getFirestore()

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

  return {
    getEventByIdAsync,
    getEventsByOrganizationIdAsync
  }
}

export default useEvent
