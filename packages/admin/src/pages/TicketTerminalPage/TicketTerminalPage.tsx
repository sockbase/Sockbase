import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdCheck, MdQrCodeScanner, MdRefresh, MdSearch } from 'react-icons/md'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { type SockbaseTicketUserDocument, type SockbaseStoreDocument, type SockbaseTicketHashIdDocument, type SockbaseTicketUsedStatus, type SockbaseTicketDocument, type SockbaseTicketMeta, type SockbasePaymentDocument, type SockbaseAccount } from 'sockbase'
import useSound from 'use-sound'
import NGSound from '../../assets/se/ng.mp3'
import OKSound from '../../assets/se/ok.mp3'
import FormButton from '../../components/Form/FormButton'
import FormCheckbox from '../../components/Form/FormCheckbox'
import FormInput from '../../components/Form/FormInput'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/FormLabel'
import FormSection from '../../components/Form/FormSection'
import Alert from '../../components/Parts/Alert'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import PageTitle from '../../components/Parts/PageTitle'
import QRReaderComponent from '../../components/Parts/QRReaderComponent'
import ApplicationStatusLabel from '../../components/StatusLabel/ApplicationStatusLabel'
import PaymentStatusLabel from '../../components/StatusLabel/PaymentStatusLabel'
import TicketTypeLabel from '../../components/StatusLabel/TicketTypeLabel'
import TicketUsedStatusLabel from '../../components/StatusLabel/TicketUsedStatusLabel'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import useDayjs from '../../hooks/useDayjs'
import useFirebaseError from '../../hooks/useFirebaseError'
import usePayment from '../../hooks/usePayment'
import useStore from '../../hooks/useStore'
import useUserData from '../../hooks/useUserData'
import useValidate from '../../hooks/useValidate'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const TicketTerminalPage: React.FC = () => {
  const { formatByDate } = useDayjs()
  const { localize } = useFirebaseError()
  const {
    getTicketUserByHashIdNullableAsync,
    getStoreByIdAsync,
    getTicketIdByHashIdAsync,
    getTicketUsedStatusByIdAsync,
    getTicketMetaByIdAsync,
    getTicketByIdAsync,
    updateTicketUsedStatusByIdAsync
  } = useStore()
  const { getPaymentByIdAsync } = usePayment()
  const { getUserDataByUserIdAndStoreIdAsync } = useUserData()
  const validator = useValidate()

  const [playSEOK] = useSound(OKSound)
  const [playSENG] = useSound(NGSound)

  const [qrData, setQRData] = useState<string | null>()

  const [ticketHashId, setTicketHashId] = useState('')
  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument | null>()
  const [store, setStore] = useState<SockbaseStoreDocument>()
  const [ticketHash, setTicketHash] = useState<SockbaseTicketHashIdDocument>()
  const [usedStatus, setUsedStatus] = useState<SockbaseTicketUsedStatus>()
  const [ticket, setTicket] = useState<SockbaseTicketDocument>()
  const [ticketMeta, setTicketMeta] = useState<SockbaseTicketMeta>()
  const [payment, setPayment] = useState<SockbasePaymentDocument | null>()
  const [ownerUser, setOwnerUser] = useState<SockbaseAccount>()
  const [usableUser, setUsableUser] = useState<SockbaseAccount>()

  const [isProgressForUsedStatus, setProgressForUsedStatus] = useState(false)
  const [usedStatusError, setUsedStatusError] = useState<string | null>()

  const [isActiveQRReader, setActiveQRReader] = useState(false)
  const [isHoldQRReader, setHoldQRReader] = useState(false)

  const type = useMemo(() => {
    if (!ticketUser || !store) return
    return store.types.find(t => t.id === ticketUser.typeId)
  }, [ticketUser, store])

  const canUseTicket = useMemo(() => {
    if (ticketMeta?.applicationStatus !== 2) return false
    if (!ticketUser?.usableUserId) return false
    if (payment && payment.status !== 1) return false
    return true
  }, [ticketMeta, ticketUser, type, payment])

  const searchTicketAsync = useCallback(async (hashId: string) => {
    const fetchAsync = async (): Promise<void> => {
      setUsedStatusError(undefined)
      setStore(undefined)
      setTicketHash(undefined)
      setUsedStatus(undefined)
      setTicketMeta(undefined)
      setTicket(undefined)
      setPayment(undefined)
      setOwnerUser(undefined)
      setUsableUser(undefined)

      const fetchedTicketUser = await getTicketUserByHashIdNullableAsync(hashId)
      setTicketUser(fetchedTicketUser)

      if (!fetchedTicketUser) return
      getStoreByIdAsync(fetchedTicketUser.storeId)
        .then(setStore)
        .catch(err => { throw err })
      getTicketIdByHashIdAsync(fetchedTicketUser.hashId)
        .then(setTicketHash)
        .catch(err => { throw err })
      if (fetchedTicketUser.usableUserId) {
        getUserDataByUserIdAndStoreIdAsync(fetchedTicketUser.usableUserId, fetchedTicketUser.storeId)
          .then(setUsableUser)
          .catch(err => { throw err })
      }
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [])

  const updateTicketUsedStatus = useCallback((used: boolean) => {
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
      getPaymentByIdAsync(ticketHash.paymentId)
        .then(setPayment)
        .catch(err => { throw err })
    } else {
      setPayment(null)
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
    <DefaultLayout title='チケット照会ターミナル' requireCommonRole={1}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdQrCodeScanner />}
        title="チケット照会ターミナル" />

      <TwoColumnLayout>
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
          {ticketMeta && type && !canUseTicket && (
            <Alert type="warning" title="このチケットは使用できません。">
              <ul>
                {ticketMeta.applicationStatus !== 2 && <li>申し込みが確定していません。管理者に問い合わせてください。</li>}
                {!ticketUser?.usableUserId && <li>チケットの割り当てが行われていません。自身で使用する場合は「チケットを有効化する」を押してください。</li>}
                {payment && payment.status !== 1 && <li>支払いが完了していません。管理者に問い合わせてください。</li>}
              </ul>
            </Alert>
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
                  <Alert type="warning" title="このチケットは使用済みです。" />
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
                    ? <TicketUsedStatusLabel used={ticketUser?.used} />
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
                <td>{(type && <TicketTypeLabel store={store} typeId={type.id} />) ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>申し込みステータス</th>
                <td>
                  {ticketUser !== undefined && ticketMeta !== null
                    ? <ApplicationStatusLabel status={ticketMeta?.applicationStatus} />
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>決済状況</th>
                <td>
                  {payment !== undefined
                    ? payment !== null
                      ? <PaymentStatusLabel payment={payment} />
                      : '支払い不要'
                    : <BlinkField />}
                </td>
              </tr>
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
      </TwoColumnLayout>
    </DefaultLayout>
  )
}

export default TicketTerminalPage

const ReaderWrap = styled.div`
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
`
