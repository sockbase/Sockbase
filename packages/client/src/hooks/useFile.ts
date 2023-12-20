import { useState } from 'react'

interface IUseFile {
  data: string | undefined
  error: DOMException | null | undefined
  openAsText: (file: Blob) => void
  openAsDataURL: (file: Blob) => void
}
const useFile = (): IUseFile => {
  const [data, setData] = useState<string>()
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

  return {
    data,
    error,
    openAsText,
    openAsDataURL
  }
}

export default useFile
