import { type getIdTokenResult } from 'firebase/auth'

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

// eslint-disable-next-line @typescript-eslint/no-redeclare
declare namespace getIdTokenResult {
  declare export interface claims {
    permissions: Record<string, int>
  }
}

declare module 'firebase/auth' {
  interface ParsedToken {
    permissions: Record<string, number>
  }
}
