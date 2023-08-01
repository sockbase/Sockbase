import 'firebase-functions'
import { type SockbaseRole } from 'sockbase'

declare module 'firebase-functions' {
  interface DecodedIdToken {
    roles: Record<string, SockbaseRole> | undefined
  }
}
