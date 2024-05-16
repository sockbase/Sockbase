import { useState } from 'react'

interface IUseFile {
  data: string | undefined
  arrayBufferResult: ArrayBuffer | undefined
  error: DOMException | null | undefined
  openAsText: (file: Blob) => void
  openAsDataURL: (file: Blob) => void
  openAsArrayBuffer: (file: Blob) => void
}
const useFile = (): IUseFile => {
  const [data, setData] = useState<string>()
  const [arrayBufferResult, setArrayBuffer] = useState<ArrayBuffer>()
  const [error, setError] = useState<DOMException | null>()

  const openAsText = (file: Blob): void => {
    const reader = new FileReader()
    reader.onerror = () => setError(reader.error)
    reader.onload = () => setData((reader.result as string) || '')

    reader.readAsText(file)
  }

  const openAsDataURL = (file: Blob): void => {
    const reader = new FileReader()
    reader.onerror = () => setError(reader.error)
    reader.onload = () => setData((reader.result as string) || '')

    reader.readAsDataURL(file)
  }
  const openAsArrayBuffer = (file: Blob): void => {
    const reader = new FileReader()
    reader.onerror = () => setError(reader.error)
    reader.onload = () => setArrayBuffer(reader.result as ArrayBuffer)

    reader.readAsArrayBuffer(file)
  }

  return {
    data,
    arrayBufferResult,
    error,
    openAsText,
    openAsDataURL,
    openAsArrayBuffer
  }
}

export default useFile
