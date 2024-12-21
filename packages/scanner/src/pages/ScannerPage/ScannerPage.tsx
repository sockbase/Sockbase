import { useCallback, useEffect, useState } from 'react'
import { PiCameraFill, PiCameraSlash, PiCheckFatFill, PiX } from 'react-icons/pi'
import styled from 'styled-components'
import QRReaderComponent from '../../components/Parts/QRReaderComponent'

const ScannerPage: React.FC = () => {
  const [isMute, setIsMute] = useState(true)
  const [isConfirm, setIsConfirm] = useState(true)
  const [scanErrors, setScanErrors] = useState<string[] | null>()

  const [qrData, setQRData] = useState('')

  useEffect(() => {
    if (!isConfirm || !qrData) return
    setIsConfirm(false)

    const isSuccess = Math.round(Math.random())
    if (isSuccess) {
      setScanErrors([])
    }
    else {
      setScanErrors([
        '存在しない QR コードです'
      ])
    }
  }, [qrData, isConfirm])

  const handleConfirm = useCallback(() => {
    setIsConfirm(true)
    setScanErrors(null)
    setQRData('')
  }, [])

  return (
    <ReaderWrap>
      <CameraArea>
        {!isMute
          ? (
            <QRReaderComponent
              onScan={data => setQRData(data.getText())}
              style={{ height: '100%' }} />
          )
          : (
            <CameraMuteStatus>
              <CameraMuteIcon>
                <PiCameraSlash />
              </CameraMuteIcon>
              <CameraMuteText>
                カメラはミュート中<br />
                復帰するには <PiCameraFill /> をタップ
              </CameraMuteText>
            </CameraMuteStatus>
          )}
      </CameraArea>
      <ControlArea>
        <ControlTop>
          チケットの QR コードを読み取ってください
        </ControlTop>
        <ControlBottom>
          <CameraControlButton
            $isMute={isMute}
            onClick={() => setIsMute(!isMute)}>
            {!isMute ? <PiCameraSlash /> : <PiCameraFill />}
          </CameraControlButton>
        </ControlBottom>
      </ControlArea>
      {!isConfirm && (
        <InformationArea>
          {scanErrors?.length === 0 && (
            <OKStatus onClick={handleConfirm}>
              <StatusIcon>
                <PiCheckFatFill />
              </StatusIcon>
            </OKStatus>
          )}
          {scanErrors && scanErrors.length > 0 && (
            <NGStatus onClick={handleConfirm}>
              <StatusIcon>
                <PiX />
              </StatusIcon>
              <StatusText>
                <ul>
                  {scanErrors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </StatusText>
            </NGStatus>
          )}
        </InformationArea>
      )}
    </ReaderWrap>
  )
}

export default ScannerPage

const ReaderWrap = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
`
const CameraArea = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  color: #404040;
`
const CameraMuteStatus = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;
  gap: 10px;
`
const CameraMuteIcon = styled.div`
  width: 48px;
  height: 48px;
  svg {
    width: 100%;
    height: 100%;
  }
`
const CameraMuteText = styled.div`
  text-align: center;
  svg {
    width: 1.25em;
    height: 1.25em;
    vertical-align: sub;
  }
`
const ControlArea = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 20% 1fr 20%;
`
const IntroductionTextBase = styled.div`
  padding: 10px;
  display: flex;
  justify-content: center;
`
const ControlTop = styled(IntroductionTextBase)`
  grid-row: 1;
  align-items: flex-end;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
`
const ControlBottom = styled(IntroductionTextBase)`
  grid-row: 3;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
`
const CameraControlButton = styled.button<{ $isMute: boolean }>`
  display: inline-block;
  width: calc(32px + 19px * 2 + 1px * 2);
  height: calc(32px + 19px * 2 + 1px * 2);
  padding: 19px;
  border-radius: 10px;
  border: 1px solid white;
  background-color: ${({ $isMute }) => $isMute ? 'white' : 'transparent'};
  color: ${({ $isMute }) => $isMute ? '#404040' : 'white'};
  svg {
    width: 32px;
    height: 32px;
  }
`
const InformationArea = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`
const StatusBase = styled.div`
  width: 100%;
  height: 100%;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
`
const OKStatus = styled(StatusBase)`
  background-color: rgba(32, 192, 32, 0.8);
`
const NGStatus = styled(StatusBase)`
  flex-direction: column;
  background-color: rgba(192, 32, 32, 0.8);

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
`
const StatusIcon = styled.div`
  width: 96px;
  height: 96px;
  svg {
    width: 100%;
    height: 100%;
  }
`
const StatusText = styled.div`
  font-size: 1.25em;
  font-weight: bold;
  text-align: center;
`
