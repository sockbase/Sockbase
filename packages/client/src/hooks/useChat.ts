import { useState } from 'react'
import { type SockbaseChatMessageDocument } from 'sockbase'
import useFirebase from './useFirebase'
import { type Unsubscribe, ref as dbRef, onValue, type DataSnapshot } from 'firebase/database'

interface IUseChat {
  messages: SockbaseChatMessageDocument[]
  startStream: (userId: string) => (() => void) | undefined
}

const useChat = (): IUseChat => {
  const { getDatabase } = useFirebase()

  const [messages, setMessages] = useState<SockbaseChatMessageDocument[]>([])
  const [streamUnsubscribeToken, setStreamUnsubscribeToken] = useState<Unsubscribe | null>()

  const startStream = (userId: string): (() => void) | undefined => {
    if (streamUnsubscribeToken) return
    setMessages([])

    const db = getDatabase()
    const messagesRef = dbRef(db, `_rooms/${userId}/messages`)
    const unsubscribeToken = onValue(
      messagesRef,
      (snapshot: DataSnapshot) => {
        if (!snapshot.exists()) {
          setMessages([])
          return
        }

        const messageDocs = snapshot.val() as Record<string, SockbaseChatMessageDocument>
        const messages = Object.entries(messageDocs)
          .map(([k, m]) => {
            return {
              ...m,
              id: k
            }
          })
        setMessages(messages)
      },
      (err) => {
        unsubscribeToken()
        setStreamUnsubscribeToken(null)
        throw err
      }
    )

    return () => {
      unsubscribeToken()
    }
  }

  return {
    messages,
    startStream
  }
}

export default useChat
