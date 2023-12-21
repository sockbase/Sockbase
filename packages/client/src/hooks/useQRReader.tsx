import { useState, useCallback } from 'react'
import { QrReader } from 'react-qr-reader'

interface IUseQRReader {
  data: string | undefined
  QRReaderComponent: React.FC
}

const useQRReader = (): IUseQRReader => {
  const [data, setData] = useState<string>()

  const handleResult = (result: any): void => {
    if (!result) return
    if (result.text === data) return
    setData(result.text)
  }

  const QRReaderComponent: React.FC = useCallback(
    () => (
      <>
        <QrReader
          constraints={{ facingMode: 'environment' }}
          onResult={handleResult}
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
    ),
    [QrReader]
  )

  return {
    data,
    QRReaderComponent
  }
}

export default useQRReader
