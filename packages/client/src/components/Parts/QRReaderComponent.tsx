import { useEffect, useRef } from 'react'
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser'
import type { Result } from '@zxing/library'

interface Props {
  onScan: (data: Result) => void
}
const QRReaderComponent: React.FC<Props> = (props) => {
  const controlsRef = useRef<IScannerControls | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (!videoRef.current) return

    const codeReader = new BrowserQRCodeReader()
    codeReader.decodeFromVideoDevice(
      undefined,
      videoRef.current,
      (result, error, controls) => {
        if (error) return
        if (result) {
          props.onScan(result)
        }

        controlsRef.current = controls
      })
      .catch(err => { throw err })

    return () => {
      if (!controlsRef.current) return

      controlsRef.current.stop()
      controlsRef.current = null
    }
  }, [props.onScan])

  return (
    <>
      <video style={{ maxWidth: '100%' }} ref={videoRef} />
    </>
  )
}

export default QRReaderComponent
