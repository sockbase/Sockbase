import type { SockbaseRole } from 'sockbase'

declare module 'firebase/auth' {
  interface ParsedToken {
    roles: Record<string, SockbaseRole> | undefined
  }
}

export interface RawEventSpace {
  spaceGroupOrder: number
  spaceOrder: number
  spaceName: string
}

export interface RawAssignEventSpace {
  applicationHashId: string
  spaceId: string
}
