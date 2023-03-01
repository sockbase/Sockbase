import useFirebase from './useFirebase'
import * as FirestoreDB from 'firebase/firestore'

import type { SockbaseEvent } from 'sockbase'

interface IUseEvent {
  getEventByIdAsync: (eventId: string) => Promise<SockbaseEvent>
}

const useEvent: () => IUseEvent = () => {
  const { getFirestore } = useFirebase()

  const getEventByIdAsync: (eventId: string) => Promise<SockbaseEvent> =
    async (eventId) => {
      const db = getFirestore()
      const _ref = FirestoreDB.doc(db, 'events', eventId)
      const snap = await FirestoreDB.getDoc(_ref)
      if (snap.exists()) {
        const {
          eventName,
          descriptions,
          spaces
        } = snap.data()

        return {
          eventName,
          descriptions,
          spaces
        }
      } else {
        throw new Error('eventId not found')
      }
    }

  return {
    getEventByIdAsync
  }
}

export default useEvent
