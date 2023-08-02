import 'firebase-admin/auth'
import { type SockbaseRole } from 'sockbase'

declare module 'firebase-admin/auth' {
  interface DecodedIdToken {
    roles: Record<string, SockbaseRole> | undefined
  }
}
