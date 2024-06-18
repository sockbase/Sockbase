import { useState, useCallback } from 'react'
import { QrReader } from 'react-qr-reader'

interface IUseQRReader {
  data: string | undefined
  QRReaderComponent: React.FC
  resetData: () => void
}

const useQRReader = (): IUseQRReader => {
  const [data, setData] = useState<string>()

  const handleResult =
    useCallback((result: any) => {
      if (!result) return
      if (result.text === data) return
      setData(result.text)
    }, [])

  const resetData = useCallback(() => setData(undefined), [])

  const QRReaderComponent: React.FC =
    useCallback(() => (
      <>
        <QrReader
          constraints={{ facingMode: 'environment' }}
          onResult={handleResult}
          scanDelay={250}
          videoStyle={
            {
              // position: 'unset'
            }
          }
          videoContainerStyle={
            {
              // paddingTop: 'unset'
            }
          }
        />
      </>
    ), [QrReader])

  return {
    data,
    QRReaderComponent,
    resetData
  }
}

export default useQRReader
