import { useCallback, useState } from 'react'
import { type SockbaseChatMessage, type SockbaseChatMessageDocument } from 'sockbase'
import useFirebase from './useFirebase'
import { type Unsubscribe, ref as dbRef, onValue, type DataSnapshot, push, serverTimestamp } from 'firebase/database'

interface IUseChat {
  messages: SockbaseChatMessageDocument[]
  startStream: (userId: string) => (() => void) | undefined
  sendMessageAsync: (message: string) => Promise<void>
}

const useChat = (): IUseChat => {
  const { getDatabase, user } = useFirebase()

  const [messages, setMessages] = useState<SockbaseChatMessageDocument[]>([])
  const [streamUnsubscribeToken, setStreamUnsubscribeToken] = useState<Unsubscribe | null>()

  const startStream = (userId: string): (() => void) | undefined => {
    if (streamUnsubscribeToken) return
    setMessages([])

    const db = getDatabase()
    const roomRef = dbRef(db, `_rooms/${userId}/messages`)
    const unsubscribeToken = onValue(
      roomRef,
      (snapshot: DataSnapshot) => {
        if (!snapshot.exists()) {
          setMessages([])
          return
        }

        const messageDocs = snapshot.val() as Record<string, any> // as Record<string, SockbaseChatMessageDocument>
        const messages = Object.entries(messageDocs)
          .map(([k, m]) => {
            return {
              ...m,
              createdAt: new Date(m._createdAt),
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

  const sendMessageAsync = useCallback(async (content: string): Promise<void> => {
    if (!user) {
      throw new Error('not logged in')
    }

    const message: SockbaseChatMessage = {
      userId: user.uid,
      _createdAt: serverTimestamp(),
      content
    }

    const db = getDatabase()
    const roomRef = dbRef(db, `_rooms/${user.uid}/messages`)
    await push(roomRef, message)
  }, [user])

  return {
    messages,
    startStream,
    sendMessageAsync
  }
}

export default useChat
