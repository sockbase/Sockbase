import { useCallback, useEffect, useState } from 'react'
import { PiCameraFill, PiCameraSlash, PiCheckFatFill, PiX } from 'react-icons/pi'
import styled from 'styled-components'
import useSound from 'use-sound'
import NGSoundWAV from '../../assets/se/ng.wav'
import OKSoundWAV from '../../assets/se/ok.wav'
import QRReaderComponent from '../../components/Parts/QRReaderComponent'
import useFirebase from '../../hooks/useFirebase'
import usePayment from '../../hooks/usePayment'
import useStore from '../../hooks/useStore'
import type {
  SockbasePaymentDocument,
  SockbaseTicketHashIdDocument,
  SockbaseTicketMeta,
  SockbaseTicketUsedStatus,
  SockbaseTicketUserDocument
} from 'sockbase'

const ScannerPage: React.FC = () => {
  const { user,
    loginByEmailAsync } = useFirebase()
  const {
    getTicketUserByHashIdAsync,
    getTicketHashAsync,
    getTicketUsedStatusByIdAsync,
    getTicketMetaByIdAsync,
    updateTicketUsedStatusByIdAsync
  } = useStore()
  const { getPaymentByIdAsync } = usePayment()

  const [playSEOK] = useSound(OKSoundWAV, { volume: 0.2 })
  const [playSENG] = useSound(NGSoundWAV, { volume: 0.2 })

  const [isCameraOff, setisCameraOff] = useState(true)
  const [isLoading, setLoading] = useState(false)
  const [isConfirm, setIsConfirm] = useState(true)
  const [scanErrors, setScanErrors] = useState<string[] | null>()

  const [qrData, setQRData] = useState('')
  const [ticketHashId, setTicketHashId] = useState('')
  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument | null>()
  const [ticketHash, setTicketHash] = useState<SockbaseTicketHashIdDocument | null>()
  const [ticketUsedStatus, setTicketUsedStatus] = useState<SockbaseTicketUsedStatus | null>()
  const [ticketMeta, setTicketMeta] = useState<SockbaseTicketMeta | null>()
  const [payment, setPayment] = useState<SockbasePaymentDocument | null>()

  const handleConfirm = useCallback(() => {
    setIsConfirm(true)
    setScanErrors(null)
    setQRData('')
    setTicketHashId('')
    setTicketUser(null)
    setTicketMeta(null)
    setTicketUsedStatus(null)
    setTicketHash(null)
  }, [])

  const handleLogin = useCallback((data: string) => {
    const [email, password] = atob(data.slice(4)).split(':')
    loginByEmailAsync(email, password)
      .then(() => {
        setScanErrors([])
      })
      .catch(err => {
        setScanErrors(['ログインに失敗しました'])
        throw err
      })
      .finally(() => setIsConfirm(false))
  }, [])

  useEffect(() => {
    if (!isConfirm || !qrData || user === undefined) return
    setLoading(true)
    if (qrData.startsWith('U0ww')) {
      if (user) {
        setScanErrors(['ログイン済みです'])
        return
      }
      handleLogin(qrData)
      return
    }
    else if (!user && !qrData.startsWith('U0ww')) {
      setScanErrors(['最初にログインしてください'])
      return
    }

    if (!qrData.startsWith('ST')) {
      setScanErrors(['不正な QR コードです'])
      return
    }

    setTicketHashId(qrData)
  }, [qrData, isConfirm, user])

  useEffect(() => {
    if (!ticketHashId) return
    getTicketUserByHashIdAsync(ticketHashId)
      .then(setTicketUser)
      .catch(err => {
        setScanErrors(['存在しない QR コードです'])
        throw err
      })
  }, [ticketHashId])

  useEffect(() => {
    if (!ticketUser) return
    if (!ticketUser.isStandalone && !ticketUser.usableUserId) {
      setScanErrors(['使用者割り当てを行なってください'])
      return
    }
    getTicketHashAsync(ticketUser.hashId)
      .then(setTicketHash)
      .catch(err => {
        setScanErrors(['内部エラーが発生しました (TicketHash)'])
        throw err
      })
  }, [ticketUser])

  useEffect(() => {
    if (!ticketHash) return
    getTicketUsedStatusByIdAsync(ticketHash.ticketId)
      .then(setTicketUsedStatus)
      .catch(err => {
        setScanErrors(['内部エラーが発生しました (TicketUsedStatus)'])
        throw err
      })
    getTicketMetaByIdAsync(ticketHash.ticketId)
      .then(setTicketMeta)
      .catch(err => {
        setScanErrors(['内部エラーが発生しました (TicketMeta)'])
        throw err
      })
    if (ticketHash.paymentId) {
      getPaymentByIdAsync(ticketHash.paymentId)
        .then(setPayment)
        .catch(err => {
          setScanErrors(['内部エラーが発生しました (Payment)'])
          throw err
        })
    }
    else {
      setPayment(null)
    }
  }, [ticketHash])

  useEffect(() => {
    if (!ticketHash || !ticketUsedStatus || !ticketMeta || payment === undefined) return
    if (ticketUsedStatus.used) {
      setScanErrors(['既に使用済みの QR コードです'])
      return
    }
    else if (ticketMeta.applicationStatus !== 2) {
      setScanErrors(['申し込みが確定していません'])
      return
    }
    else if (payment && payment.status !== 1) {
      setScanErrors(['支払いが完了していません'])
      return
    }

    updateTicketUsedStatusByIdAsync(ticketHash.ticketId, true)
      .then(() => {
        setScanErrors([])
      })
      .catch(err => {
        setScanErrors(['消し込みに失敗しました'])
        throw err
      })
  }, [ticketHash, ticketUsedStatus, ticketMeta, payment])

  useEffect(() => {
    if (!scanErrors) return
    if (scanErrors?.length === 0) {
      playSEOK()
    }
    else if (scanErrors && scanErrors.length > 0) {
      playSENG()
    }
    setIsConfirm(false)
    setLoading(false)
  }, [scanErrors])

  return (
    <ReaderWrap>
      <CameraArea>
        {!isCameraOff
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
                カメラオフ中<br />
                復帰するには <PiCameraFill /> をタップ
              </CameraMuteText>
            </CameraMuteStatus>
          )}
      </CameraArea>
      <ControlArea>
        <ControlTop>
          {!user ? 'ログイン QR コードを読み取ってください' : 'QR コードを読み取ってください'}
        </ControlTop>
        <ControlBottom>
          <CameraControlButton
            $isCameraOff={isCameraOff}
            onClick={() => setisCameraOff(!isCameraOff)}>
            {!isCameraOff ? <PiCameraSlash /> : <PiCameraFill />}
          </CameraControlButton>
        </ControlBottom>
      </ControlArea>
      {isLoading && (
        <LoadingArea>
          <LoadingCircle />
        </LoadingArea>
      )}
      {!isConfirm && (
        <InformationArea>
          {scanErrors?.length === 0 && (
            <OKStatus onClick={handleConfirm}>
              <StatusIcon>
                <PiCheckFatFill />
              </StatusIcon>
              <StatusText>
                タップして閉じる
              </StatusText>
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
                <br />
                タップして閉じる
              </StatusText>
              <StatusSubText>
                {qrData}
              </StatusSubText>
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
const CameraControlButton = styled.button<{ $isCameraOff: boolean }>`
  display: inline-block;
  width: calc(32px + 19px * 2 + 1px * 2);
  height: calc(32px + 19px * 2 + 1px * 2);
  padding: 19px;
  border-radius: 10px;
  border: 1px solid white;
  background-color: ${({ $isCameraOff }) => $isCameraOff ? 'white' : 'transparent'};
  color: ${({ $isCameraOff }) => $isCameraOff ? '#404040' : 'white'};
  svg {
    width: 32px;
    height: 32px;
  }
`
const LoadingArea = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
`
const LoadingCircle = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 4px solid white;
  border-top-color: transparent;
  animation: spin 0.75s linear infinite;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
  flex-direction: column;
`
const OKStatus = styled(StatusBase)`
  background-color: rgba(32, 192, 32, 0.9);
`
const NGStatus = styled(StatusBase)`
  background-color: rgba(192, 32, 32, 0.9);

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
const StatusSubText = styled.div`
  font-size: 0.75em;
  font-weight: normal;
  text-align: center;
`
