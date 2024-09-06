import { useCallback, useState } from 'react'
import { QrReader } from 'react-qr-reader'

interface Props {
  setData: (data: string) => void
}
const QRReaderComponent: React.FC<Props> = (props) => {
  const [data, setData] = useState<string>()

  const handleScan = useCallback((result: any) => {
    console.log(result?.text, data)
    if (!result?.text) return
    props.setData(result?.text)
    setData(result?.text)
  }, [data])

  return (
    <>
      <QrReader
        constraints={{ facingMode: 'environment' }}
        onResult={handleScan}
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
  )
}

export default QRReaderComponent
