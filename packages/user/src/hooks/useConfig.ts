import { useCallback } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import useFirebase from './useFirebase'
import type { SockbaseReceiptConfig } from 'sockbase'

interface IUseConfig {
  getReceiptConfigForNectaritionAsync: () => Promise<SockbaseReceiptConfig>
  getReceiptConfigForNPJPNetAsync: () => Promise<SockbaseReceiptConfig>
}
const useConfig = (): IUseConfig => {
  const { getFirestore } = useFirebase()

  const db = getFirestore()

  const getReceiptConfigForNectaritionAsync = useCallback(() => getReceiptConfigCoreAsync('nectarition'), [])
  const getReceiptConfigForNPJPNetAsync = useCallback(() => getReceiptConfigCoreAsync('npjpnet'), [])

  const getReceiptConfigCoreAsync = useCallback(async (orgId: string) => {
    const configRef = doc(db, `configs/receipt-${orgId}`)
    const configDoc = await getDoc(configRef)
    const config = configDoc.data() as SockbaseReceiptConfig | undefined
    if (!config) {
      throw new Error('config not found')
    }
    return config
  }, [])

  return {
    getReceiptConfigForNectaritionAsync,
    getReceiptConfigForNPJPNetAsync
  }
}

export default useConfig
