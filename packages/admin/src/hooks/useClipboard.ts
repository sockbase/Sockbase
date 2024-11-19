import { useCallback } from 'react'

interface IUseClipboard {
  copyToClipboardAsync: (data: string) => Promise<void>
}
const useClipboard = (): IUseClipboard => {
  const copyToClipboardAsync =
    useCallback(async (data: string) => {
      await navigator.clipboard.writeText(data)
    }, [])

  return {
    copyToClipboardAsync
  }
}

export default useClipboard
