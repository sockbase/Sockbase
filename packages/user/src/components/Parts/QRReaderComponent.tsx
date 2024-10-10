import { useEffect, useRef } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'
import type { Result } from '@zxing/library'

interface Props {
  onScan: (data: Result) => void
}
const QRReaderComponent: React.FC<Props> = (props) => {
  const mountedRef = useRef<boolean>(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!videoRef.current) return
    mountedRef.current = true

    const codeReader = new BrowserQRCodeReader()
    codeReader.decodeFromVideoDevice(
      undefined,
      videoRef.current,
      (result, error, controls) => {
        if (!mountedRef.current) {
          controls.stop()
        }

        if (error) return
        
        if (result) {
          props.onScan(result)
        }
      })
      .catch(err => { throw err })

    return () => {
      mountedRef.current = false
    }
  }, [props])

  return (
    <>
      <video style={{ maxWidth: '100%' }} ref={videoRef} />
    </>
  )
}

export default QRReaderComponent
