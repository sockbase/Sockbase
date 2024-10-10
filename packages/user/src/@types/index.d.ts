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

export interface ImportedSpace {
  spaceId?: string
  appHashId: string
}
