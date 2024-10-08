import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdCheck, MdQrCodeScanner, MdRefresh, MdSearch } from 'react-icons/md'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import {
  type SockbaseTicketUsedStatus,
  type SockbaseAccount,
  type SockbasePaymentDocument,
  type SockbaseStoreDocument,
  type SockbaseTicketDocument,
  type SockbaseTicketHashIdDocument,
  type SockbaseTicketUserDocument,
  type SockbaseTicketMeta
} from 'sockbase'
import useSound from 'use-sound'
import NGSound from '../../../assets/se/ng.mp3'
import OKSound from '../../../assets/se/ok.mp3'
import FormButton from '../../../components/Form/Button'
import FormCheckbox from '../../../components/Form/Checkbox'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormInput from '../../../components/Form/Input'
import FormLabel from '../../../components/Form/Label'
import Alert from '../../../components/Parts/Alert'
import BlinkField from '../../../components/Parts/BlinkField'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import IconLabel from '../../../components/Parts/IconLabel'
import QRReaderComponent from '../../../components/Parts/QRReaderComponent'
import ApplicationStatusLabel from '../../../components/Parts/StatusLabel/ApplicationStatusLabel'
import PaymentStatusLabel from '../../../components/Parts/StatusLabel/PaymentStatusLabel'
import StoreTypeLabel from '../../../components/Parts/StatusLabel/StoreTypeLabel'
import TicketUsedStatusLabel from '../../../components/Parts/StatusLabel/TicketUsedStatusLabel'
import useDayjs from '../../../hooks/useDayjs'
import useFirebaseError from '../../../hooks/useFirebaseError'
import usePayment from '../../../hooks/usePayment'
import useStore from '../../../hooks/useStore'
import useUserData from '../../../hooks/useUserData'
import useValidate from '../../../hooks/useValidate'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../layouts/TwoColumnsLayout/TwoColumnsLayout'

const DashboardTicketTerminalPage: React.FC = () => {
  const { formatByDate } = useDayjs()
  const { localize } = useFirebaseError()
  const {
    getTicketUserByHashIdOptionalAsync,
    getStoreByIdAsync,
    getTicketIdByHashIdAsync,
    getTicketUsedStatusByIdAsync,
    getTicketMetaByIdAsync,
    getTicketByIdAsync,
    updateTicketUsedStatusByIdAsync
  } = useStore()
  const { getPaymentAsync } = usePayment()
  const { getUserDataByUserIdAndStoreIdAsync } = useUserData()
  const validator = useValidate()

  const [playSEOK] = useSound(OKSound)
  const [playSENG] = useSound(NGSound)

  const [qrData, setQRData] = useState<string | null>()

  const [ticketHashId, setTicketHashId] = useState('')
  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument | null>()
  const [store, setStore] = useState<SockbaseStoreDocument | null>()
  const [ticketHash, setTicketHash] = useState<SockbaseTicketHashIdDocument | null>()
  const [usedStatus, setUsedStatus] = useState<SockbaseTicketUsedStatus | null>()
  const [ticket, setTicket] = useState<SockbaseTicketDocument | null>()
  const [ticketMeta, setTicketMeta] = useState<SockbaseTicketMeta | null>()
  const [payment, setPayment] = useState<SockbasePaymentDocument | null>()
  const [ownerUser, setOwnerUser] = useState<SockbaseAccount | null>()
  const [usableUser, setUsableUser] = useState<SockbaseAccount | null>()

  const [isProgressForUsedStatus, setProgressForUsedStatus] = useState(false)
  const [usedStatusError, setUsedStatusError] = useState<string | null>()

  const [isActiveQRReader, setActiveQRReader] = useState(false)
  const [isHoldQRReader, setHoldQRReader] = useState(false)

  const type = useMemo(() => {
    if (!ticketUser || !store) return
    return store.types
      .filter(t => t.id === ticketUser.typeId)[0]
  }, [ticketUser, store])

  const canUseTicket = useMemo(() => {
    if (ticketMeta?.applicationStatus !== 2) return false
    if (!ticketUser?.usableUserId) return false
    if (type?.productInfo && payment?.status !== 1) return false
    return true
  }, [ticketMeta, ticketUser, type, payment])

  const searchTicketAsync = useCallback(async (hashId: string): Promise<void> => {
    const fetchAsync = async (): Promise<void> => {
      setUsedStatusError(null)
      setStore(null)
      setTicketHash(null)
      setUsedStatus(null)
      setTicketMeta(null)
      setTicket(null)
      setPayment(null)
      setOwnerUser(null)
      setUsableUser(null)

      const fetchedTicketUser = await getTicketUserByHashIdOptionalAsync(hashId)
      setTicketUser(fetchedTicketUser)

      if (!fetchedTicketUser) return

      getStoreByIdAsync(fetchedTicketUser.storeId)
        .then(fetchedStore => setStore(fetchedStore))
        .catch(err => { throw err })

      getTicketIdByHashIdAsync(fetchedTicketUser.hashId)
        .then(fetchedHash => setTicketHash(fetchedHash))
        .catch(err => { throw err })

      if (fetchedTicketUser.usableUserId) {
        getUserDataByUserIdAndStoreIdAsync(fetchedTicketUser.usableUserId, fetchedTicketUser.storeId)
          .then(fetchedUser => setUsableUser(fetchedUser))
          .catch(err => { throw err })
      }
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [])

  const updateTicketUsedStatus = useCallback((used: boolean): void => {
    if (!ticketHash) return
    if (!confirm(`使用ステータスを ${used ? '使用済み' : '未使用'} に変更します。よろしいですか？`)) return

    setUsedStatusError(null)
    setProgressForUsedStatus(true)

    updateTicketUsedStatusByIdAsync(ticketHash.ticketId, used)
      .then(() => {
        const now = new Date()
        setTicketHash(s => (s && { ...s, used, usedAt: now }))
        setTicketUser(s => (s && { ...s, used, usedAt: now }))
        alert(`使用ステータスを ${used ? '使用済み' : '未使用'} に変更しました。`)
      })
      .catch((err: Error) => {
        setUsedStatusError(localize(err.message))
        throw err
      })
      .finally(() => setProgressForUsedStatus(false))
  }, [ticketHash])

  const handleSearch = useCallback(() => {
    if (!ticketHashId) return
    searchTicketAsync(ticketHashId)
      .catch(err => { throw err })
  }, [ticketHashId])

  const keyDownEvent = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      setTicketHashId('')
      handleSearch()
      return
    } else if (event.key === 'Escape') {
      setTicketHashId('')
      setTicketUser(undefined)
      return
    } else if (event.key === 'Backspace') {
      const idLength = ticketHashId.length
      const newTicketHashId = ticketHashId.slice(0, idLength - 1)
      setTicketHashId(newTicketHashId)
      return
    } else if (event.key.length > 1) {
      return
    }

    if (ticketUser === null) {
      setTicketUser(undefined)
    }
    setTicketHashId(s => `${s}${event.key}`)
  }, [ticketUser, ticketHashId])

  const handleReset = useCallback((showDialog: boolean) => {
    if (showDialog && !confirm('読み取り結果をリセットします。\nよろしいですか？')) return

    setUsedStatusError(undefined)
    setTicketUser(undefined)
    setStore(undefined)
    setTicketHash(undefined)
    setUsedStatus(undefined)
    setTicketMeta(undefined)
    setTicket(undefined)
    setPayment(undefined)
    setOwnerUser(undefined)
    setUsableUser(undefined)
  }, [])

  useEffect(() => {
    if (ticketHashId) return
    handleReset(false)
  }, [ticketHashId])

  useEffect(() => {
    if (!ticketHash) return

    getTicketByIdAsync(ticketHash.ticketId)
      .then(fetchedTicket => setTicket(fetchedTicket))
      .catch(err => { throw err })
    getTicketUsedStatusByIdAsync(ticketHash.ticketId)
      .then(fetchedUsedStatus => setUsedStatus(fetchedUsedStatus))
      .catch(err => { throw err })
    getTicketMetaByIdAsync(ticketHash.ticketId)
      .then(fetchedMeta => setTicketMeta(fetchedMeta))
      .catch(err => { throw err })

    if (ticketHash.paymentId) {
      getPaymentAsync(ticketHash.paymentId)
        .then(fetchedPayment => setPayment(fetchedPayment))
        .catch(err => { throw err })
    }
  }, [ticketHash])

  useEffect(() => {
    if (!ticket) return

    getUserDataByUserIdAndStoreIdAsync(ticket.userId, ticket.storeId)
      .then(fetchedUser => setOwnerUser(fetchedUser))
      .catch(err => { throw err })
  }, [ticket])

  useEffect(() => {
    if (!qrData) return
    if (qrData === ticketHashId) return

    if (!validator.isTicketHashId(qrData)) {
      playSENG()
      return
    }

    setTicketHashId(qrData)
    searchTicketAsync(qrData)
      .then(() => {
        playSEOK()
      })
      .catch(err => {
        playSENG()
        throw err
      })

    if (isHoldQRReader) return
    setActiveQRReader(false)
    setQRData(null)
  }, [qrData, ticketHashId])

  useEffect(() => {
    document.addEventListener('keydown', keyDownEvent)
    return () => document.removeEventListener('keydown', keyDownEvent)
  }, [keyDownEvent])

  return (
    <DashboardBaseLayout title="チケット照会ターミナル" requireCommonRole={1}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle title="チケット照会ターミナル" icon={<MdQrCodeScanner />} description="チケット管理" />

      <TwoColumnsLayout>
        <>
          <p>
            QR リーダーを使用してチケットの QR コードを読み取ってください。
          </p>
          <FormSection>
            <FormItem>
              <FormCheckbox
                name="isActiveQRReader"
                label="QR リーダーを開く"
                checked={isActiveQRReader}
                onChange={(c) => setActiveQRReader(c)} />
            </FormItem>
            {isActiveQRReader && <FormItem>
              <FormCheckbox
                name="isHoldQRReader"
                label="読み取り後に QR リーダを保持する"
                checked={isHoldQRReader}
                onChange={(c) => setHoldQRReader(c)} />
            </FormItem>}
          </FormSection>

          <FormSection>
            <FormItem>
              <FormLabel>チケット ID</FormLabel>
              <FormInput
                value={ticketHashId}
                onChange={e => setTicketHashId(e.target.value)}
                placeholder="チケット ID"
                disabled/>
            </FormItem>
            <FormItem>
              <FormButton onClick={handleSearch} disabled={!ticketHashId} color="default">
                <IconLabel label="検索" icon={<MdSearch />} />
              </FormButton>
            </FormItem>
          </FormSection>
          {ticketUser === null && (
            <Alert type="error" title="チケット情報が見つかりませんでした">
              正しいチケット ID を入力してください。
            </Alert>
          )}

          {isActiveQRReader && (
            <ReaderWrap>
              <QRReaderComponent onScan={r => setQRData(r.getText())}/>
            </ReaderWrap>
          )}
        </>

        <>
          <h2>チケット情報</h2>
          {ticketMeta && type && (
            (ticketMeta.applicationStatus !== 2 || !ticketUser?.usableUserId || (type.productInfo && payment?.status !== 1)) && (
              <Alert type="warning" title="このチケットは使用できません。">
                <ul>
                  {ticketMeta.applicationStatus !== 2 && <li>申し込みが確定していません。</li>}
                  {!ticketUser?.usableUserId && <li>チケットの割り当てが行われていません。</li>}
                  {type.productInfo && payment?.status !== 1 && <li>支払いが完了していません。</li>}
                </ul>
              </Alert>
            )
          )}

          {usedStatus && (
            <FormSection>
              {!usedStatus.used && <FormItem>
                <FormButton onClick={() => updateTicketUsedStatus(true)} disabled={isProgressForUsedStatus || !canUseTicket}>
                  <IconLabel label="使用済みにする" icon={<MdCheck />} />
                </FormButton>
              </FormItem>}
              {usedStatus.used && (
                <>
                  <p>
                    このチケットは使用済みです。
                  </p>
                  <FormButton onClick={() => handleReset(true)} color="default">
                    <IconLabel
                      label="読み取りリセット"
                      icon={<MdRefresh />} />
                  </FormButton>
                </>
              )}
            </FormSection>
          )}

          {usedStatusError && (
            <Alert type="error" title="エラーが発生しました">
              {usedStatusError}
            </Alert>
          )}

          <table>
            <tbody>
              <tr>
                <th>使用ステータス</th>
                <td>
                  {ticketUser !== undefined && ticketUser !== null
                    ? <TicketUsedStatusLabel status={ticketUser?.used} />
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>使用者</th>
                <td>{ticketUser !== undefined && usableUser !== null ? usableUser?.name : <BlinkField />}</td>
              </tr>
              <tr>
                <th>使用日時</th>
                <td>
                  {ticketUser !== undefined && ticketUser !== null
                    ? (ticketUser?.usedAt && formatByDate(ticketUser.usedAt, 'YYYY年 M月 D日 H時mm分')) || '未使用'
                    : <BlinkField />}
                </td>
              </tr>
            </tbody>
          </table>

          <table>
            <tbody>
              <tr>
                <th>チケットストア</th>
                <td>{ticketUser !== undefined && store !== null ? store?.name : <BlinkField />}</td>
              </tr>
              <tr>
                <th>参加種別</th>
                <td>{(type && <StoreTypeLabel type={type} />) ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>申し込みステータス</th>
                <td>
                  {ticketUser !== undefined && ticketMeta !== null
                    ? <ApplicationStatusLabel status={ticketMeta?.applicationStatus} />
                    : <BlinkField />}
                </td>
              </tr>
              {type?.productInfo &&
                  <tr>
                    <th>決済状況</th>
                    <td>
                      {payment
                        ? <PaymentStatusLabel payment={payment} />
                        : <BlinkField />}
                    </td>
                  </tr>}
              <tr>
                <th>申し込み日時</th>
                <td>
                  {ticketUser !== undefined && ticket !== null
                    ? ticket?.createdAt && formatByDate(ticket.createdAt, 'YYYY年 M月 D日 H時mm分')
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>購入者</th>
                <td>{ticketUser !== undefined && ownerUser !== null ? ownerUser?.name : <BlinkField />}</td>
              </tr>
            </tbody>
          </table>
        </>
      </TwoColumnsLayout>
    </DashboardBaseLayout >
  )
}

export default DashboardTicketTerminalPage

const ReaderWrap = styled.div`
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
`
