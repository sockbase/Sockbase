import { useCallback } from 'react'
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore'
import { eventConverter } from '../libs/converters'
import type { SockbaseEventDocument } from 'sockbase'

interface IUseEvent {
  getEventsByOrganizationIdAsync: (organizationId: string) => Promise<SockbaseEventDocument[]>
}

const useEvent = (): IUseEvent => {
  const getEventsByOrganizationIdAsync =
  useCallback(async (organizationId: string): Promise<SockbaseEventDocument[]> => {
    const db = getFirestore()
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
    getEventsByOrganizationIdAsync
  }
}

export default useEvent
