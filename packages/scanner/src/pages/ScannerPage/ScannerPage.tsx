import { useCallback, useEffect, useMemo, useState } from 'react'
import { PiCameraFill, PiCameraSlash, PiCheckFatFill, PiX } from 'react-icons/pi'
import styled from 'styled-components'
import useSound from 'use-sound'
import NGSoundWAV from '../../assets/se/ng.wav'
import OKSoundWAV from '../../assets/se/ok.wav'
import QRReaderComponent from '../../components/Parts/QRReaderComponent'
import useFirebase from '../../hooks/useFirebase'
import usePayment from '../../hooks/usePayment'
import useRole from '../../hooks/useRole'
import useStore from '../../hooks/useStore'
import type {
  SockbasePaymentDocument,
  SockbaseTicketHashIdDocument,
  SockbaseTicketMeta,
  SockbaseTicketUsedStatus,
  SockbaseTicketUserDocument
} from 'sockbase'

const ScannerPage: React.FC = () => {
  const { user, loginByEmailAsync } = useFirebase()
  const { commonRole } = useRole()
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
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirm, setIsConfirm] = useState(true)
  const [scanErrors, setScanErrors] = useState<{ error: string, detail?: string }[] | null>()

  const [qrData, setQRData] = useState('')
  const [ticketHashId, setTicketHashId] = useState('')
  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument | null>()
  const [ticketHash, setTicketHash] = useState<SockbaseTicketHashIdDocument | null>()
  const [ticketUsedStatus, setTicketUsedStatus] = useState<SockbaseTicketUsedStatus | null>()
  const [ticketMeta, setTicketMeta] = useState<SockbaseTicketMeta | null>()
  const [payment, setPayment] = useState<SockbasePaymentDocument | null>()

  const isValidRole = useMemo(() => {
    if (commonRole === undefined) return undefined
    return !!commonRole && commonRole >= 1
  }, [commonRole])

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
      .catch(err => {
        setScanErrors([{ error: '管理者に問い合わせてください', detail: `内部エラー/Login:${data}` }])
        throw err
      })
  }, [])

  useEffect(() => {
    if (!isConfirm || !qrData) return
    setIsLoading(true)
    if (qrData.startsWith('U0ww')) {
      if (!user) {
        handleLogin(qrData)
        return
      }
      else if (isValidRole) {
        setScanErrors([])
        return
      }
      else {
        setScanErrors([{ error: '管理者に問い合わせてください', detail: `不正なアカウント/${user.uid}` }])
        return
      }
    }
    else if (!user && !qrData.startsWith('U0ww')) {
      setScanErrors([{ error: 'ログインが必要', detail: 'ログイン QR コードを読み取ってください' }])
      return
    }

    if (!qrData.startsWith('ST')) {
      setScanErrors([{ error: '不明な QR コード', detail: qrData }])
      return
    }

    setTicketHashId(qrData)
  }, [qrData, isConfirm, isValidRole, user])

  useEffect(() => {
    if (!ticketHashId) return
    getTicketUserByHashIdAsync(ticketHashId)
      .then(setTicketUser)
      .catch(err => {
        setScanErrors([{ error: 'チケット情報が見つからない', detail: 'イベント名を確認してください' }])
        throw err
      })
  }, [ticketHashId])

  useEffect(() => {
    if (!ticketUser) return
    if (!ticketUser.isStandalone && !ticketUser.usableUserId) {
      setScanErrors([{ error: '使用者設定が未完了', detail: 'チケット画面の「チケットを有効化する」をタップしてください' }])
      return
    }
    getTicketHashAsync(ticketUser.hashId)
      .then(setTicketHash)
      .catch(err => {
        setScanErrors([{ error: '管理者に問い合わせてください', detail: `内部エラー/GetTicketHash:${qrData}` }])
        throw err
      })
  }, [ticketUser])

  useEffect(() => {
    if (!ticketHash) return
    getTicketUsedStatusByIdAsync(ticketHash.ticketId)
      .then(setTicketUsedStatus)
      .catch(err => {
        setScanErrors([{ error: '管理者に問い合わせてください', detail: `内部エラー/GetTicketUsedStatus:${qrData}` }])
        throw err
      })
    getTicketMetaByIdAsync(ticketHash.ticketId)
      .then(setTicketMeta)
      .catch(err => {
        setScanErrors([{ error: '管理者に問い合わせてください', detail: `内部エラー/GetTicketMeta:${qrData}` }])
        throw err
      })
    if (ticketHash.paymentId) {
      getPaymentByIdAsync(ticketHash.paymentId)
        .then(setPayment)
        .catch(err => {
          setScanErrors([{ error: '管理者に問い合わせてください', detail: `内部エラー/GetPayment:${qrData}` }])
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
      setScanErrors([{ error: '使用済み', detail: 'このチケットは使用済みです' }])
      return
    }
    else if (ticketMeta.applicationStatus !== 2) {
      setScanErrors([{ error: '管理者に問い合わせてください', detail: `申込ステータス不正/${qrData}/${ticketMeta.applicationStatus}` }])
      return
    }
    else if (payment && payment.status !== 1) {
      setScanErrors([{ error: '管理者に問い合わせてください', detail: `決済ステータス不正/${qrData}/${payment.status}` }])
      return
    }

    updateTicketUsedStatusByIdAsync(ticketHash.ticketId, true)
      .then(() => {
        setScanErrors([])
      })
      .catch(err => {
        setScanErrors([{ error: '管理者に問い合わせてください', detail: `内部エラー/UpdateTicketUsedStatus:${qrData}` }])
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
    setIsLoading(false)
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
          {!user && !isValidRole ? 'ログイン QR コードを読み取ってください' : 'QR コードを読み取ってください'}
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
              <StatusHeader>
                <StatusIcon>
                  <PiCheckFatFill />
                </StatusIcon>
              </StatusHeader>
              <ActionHelp>
                <ActionHelpText>
                  タップして閉じる
                </ActionHelpText>
              </ActionHelp>
            </OKStatus>
          )}
          {scanErrors && scanErrors.length > 0 && (
            <NGStatus onClick={handleConfirm}>
              <StatusHeader>
                <StatusIcon>
                  <PiX />
                </StatusIcon>
                <StatusText>
                  {scanErrors.map((e, i) => (
                    <>
                      <StatusText key={`${i}-error`}>{e.error}</StatusText>
                      {e.detail && <StatusSubText key={`${i}-detail`}>{e.detail}</StatusSubText>}
                    </>
                  ))}
                </StatusText>
              </StatusHeader>
              <ActionHelp>
                <ActionHelpText>
                  タップして閉じる
                </ActionHelpText>
              </ActionHelp>
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
  gap: 10px;
`
const StatusHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 20px;
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
const ActionHelp = styled.div`
  animation: blink 1.5s infinite;
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }
`
const ActionHelpText = styled.span`
  display: inline-block;
  padding: 5px 10px;
  border: 1px solid white;
  border-radius: 5px;
`
