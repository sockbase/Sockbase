import { useCallback, useState } from 'react'
import { type Unsubscribe, onValue, ref, set } from 'firebase/database'
import useFirebase from './useFirebase'

interface IUseStream {
  startStream: (channel: string) => Unsubscribe
  writeStream: (channel: string, data: string | null) => void
  streamData: string | null | undefined
}
const useStream = (): IUseStream => {
  const { getDatabase, user } = useFirebase()

  const [streamData, setStreamData] = useState<string | null>()

  const startStream =
    useCallback((channel: string): Unsubscribe => {
      if (!user) {
        throw new Error('unauthorized')
      }

      const rtdb = getDatabase()
      const streamRef = ref(rtdb, `users/${user.uid}/streams/${channel}`)

      return onValue(streamRef,
        (snapshot) => setStreamData(snapshot.val()?.data ?? null),
        err => { throw err })
    }, [user])

  const writeStream =
    useCallback((channel: string, data: string | null): void => {
      if (!user) {
        throw new Error('unauthorized')
      }

      const rtdb = getDatabase()
      const streamRef = ref(rtdb, `users/${user.uid}/streams/${channel}`)
      set(streamRef, null)
        .catch(err => { throw err })

      if (data) {
        set(streamRef, { data })
          .catch(err => { throw err })
      }
    }, [user])

  return {
    startStream,
    writeStream,
    streamData
  }
}

export default useStream
