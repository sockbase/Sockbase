import type { SockbaseRole } from 'sockbase'

// https://zipcloud.ibsnet.co.jp/api/search
export interface PostalCodeResult {
  message: string | null
  results: Array<{
    address1: string
    address2: string
    address3: string
    kana1: string
    kana2: string
    kana3: string
    prefcode: number
    zipcode: number
  }>
  status: number
}

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
