import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdCheck, MdQrCodeScanner, MdRefresh, MdSearch } from 'react-icons/md'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
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
import useRole from '../../hooks/useRole'
import useStore from '../../hooks/useStore'
import useUserData from '../../hooks/useUserData'
import useValidate from '../../hooks/useValidate'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type {
  SockbaseTicketUserDocument,
  SockbaseStoreDocument,
  SockbaseTicketHashIdDocument,
  SockbaseTicketUsedStatus,
  SockbaseTicketDocument,
  SockbaseTicketMeta,
  SockbasePaymentDocument,
  SockbaseAccount
} from 'sockbase'

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
  const { commonRole } = useRole()

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
  const [ownerUser, setOwnerUser] = useState<SockbaseAccount | null>()
  const [usableUser, setUsableUser] = useState<SockbaseAccount | null>()

  const [isProgressForUsedStatus, setProgressForUsedStatus] = useState(false)
  const [usedStatusError, setUsedStatusError] = useState<string | null>()

  const [isActiveQRReader, setActiveQRReader] = useState(false)
  const [isHoldQRReader, setHoldQRReader] = useState(false)

  const type = useMemo(() => {
    if (!ticket || !store) return
    return store.types.find(t => t.id === ticket.typeId)
  }, [ticket, store])

  const canUseTicket = useMemo(() => {
    if (ticketMeta?.applicationStatus !== 2) return false
    if (!ticket?.isStandalone && !ticketUser?.usableUserId) return false
    if (payment && payment.status !== 1) return false
    return true
  }, [ticket, ticketMeta, ticketUser, type, payment])

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

      const fetchedTicketHash = await getTicketIdByHashIdAsync(hashId)
        .catch(err => { throw err })
      setTicketHash(fetchedTicketHash)

      getTicketUserByHashIdNullableAsync(fetchedTicketHash.hashId)
        .then(setTicketUser)
        .catch(err => { throw err })
      getTicketByIdAsync(fetchedTicketHash.ticketId)
        .then(fetchedTicket => setTicket(fetchedTicket))
        .catch(err => { throw err })

      getTicketUsedStatusByIdAsync(fetchedTicketHash.ticketId)
        .then(fetchedUsedStatus => setUsedStatus(fetchedUsedStatus))
        .catch(err => { throw err })
      getTicketMetaByIdAsync(fetchedTicketHash.ticketId)
        .then(fetchedMeta => setTicketMeta(fetchedMeta))
        .catch(err => { throw err })

      if (fetchedTicketHash.paymentId) {
        getPaymentByIdAsync(fetchedTicketHash.paymentId)
          .then(setPayment)
          .catch(err => { throw err })
      }
      else {
        setPayment(null)
      }
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [])

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
    if (!ticket) return
    getStoreByIdAsync(ticket.storeId)
      .then(setStore)
      .catch(err => { throw err })
  }, [ticket])

  useEffect(() => {
    if (!ticketUser) return
    if (ticketUser.usableUserId) {
      getUserDataByUserIdAndStoreIdAsync(ticketUser.usableUserId, ticketUser.storeId)
        .then(setUsableUser)
        .catch(err => { throw err })
    }
    else {
      setUsableUser(null)
    }
  }, [ticketUser])

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
    }
    else if (event.key === 'Escape') {
      setTicketHashId('')
      setTicketUser(undefined)
      return
    }
    else if (event.key === 'Backspace') {
      const idLength = ticketHashId.length
      const newTicketHashId = ticketHashId.slice(0, idLength - 1)
      setTicketHashId(newTicketHashId)
      return
    }
    else if (event.key.length > 1) {
      return
    }

    if (ticketUser === null) {
      setTicketUser(undefined)
    }
    setTicketHashId(s => `${s}${event.key}`)
  }, [ticketUser, ticketHashId])

  useEffect(() => {
    if (ticketHashId) return
    handleReset(false)
  }, [ticketHashId])

  useEffect(() => {
    if (!ticket) return
    if (ticket.userId) {
      getUserDataByUserIdAndStoreIdAsync(ticket.userId, ticket.storeId)
        .then(fetchedUser => setOwnerUser(fetchedUser))
        .catch(err => { throw err })
    }
    else {
      setOwnerUser(null)
    }
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
    <DefaultLayout
      requireCommonRole={1}
      title="チケット照会ターミナル (旧)">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdQrCodeScanner />}
        title="チケット照会ターミナル (旧)" />

      <Alert
        title="Sockbase SCANNER を使用してください"
        type="warning">
          チケット照会ターミナルは近日中に廃止されます。<br />
          「<a href="https://scan.sockbase.net/">Sockbase SCANNER</a>」を使用してください。
      </Alert>

      <TwoColumnLayout>
        <>
          <p>
            QR リーダーを使用してチケットの QR コードを読み取ってください。
          </p>
          <FormSection>
            <FormItem>
              <FormCheckbox
                checked={isActiveQRReader}
                label="QR リーダーを開く"
                name="isActiveQRReader"
                onChange={c => setActiveQRReader(c)} />
            </FormItem>
            {isActiveQRReader && (
              <FormItem>
                <FormCheckbox
                  checked={isHoldQRReader}
                  label="読み取り後に QR リーダを保持する"
                  name="isHoldQRReader"
                  onChange={c => setHoldQRReader(c)} />
              </FormItem>
            )}
          </FormSection>

          <FormSection>
            <FormItem>
              <FormLabel>チケット ID</FormLabel>
              <FormInput
                disabled
                onChange={e => setTicketHashId(e.target.value)}
                placeholder="チケット ID"
                value={ticketHashId} />
            </FormItem>
            <FormItem>
              <FormButton
                color="default"
                disabled={!ticketHashId}
                onClick={handleSearch}>
                <IconLabel
                  icon={<MdSearch />}
                  label="検索" />
              </FormButton>
            </FormItem>
          </FormSection>
          {ticketUser === null && (
            <Alert
              title="チケット情報が見つかりませんでした"
              type="error">
              正しいチケット ID を入力してください。
            </Alert>
          )}

          {isActiveQRReader && (
            <ReaderWrap>
              <QRReaderComponent onScan={r => setQRData(r.getText())} />
            </ReaderWrap>
          )}
        </>

        <>
          <h2>チケット情報</h2>
          {ticketMeta && type && !canUseTicket && (
            <Alert
              title="このチケットは使用できません。"
              type="warning">
              <ul>
                {ticketMeta.applicationStatus !== 2 && <li>申し込みが確定していません。管理者に問い合わせてください。</li>}
                {!ticket?.isStandalone && !ticketUser?.usableUserId && <li>チケットの割り当てが行われていません。自身で使用する場合は「チケットを有効化する」を押してください。</li>}
                {payment && payment.status !== 1 && <li>支払いが完了していません。管理者に問い合わせてください。</li>}
              </ul>
            </Alert>
          )}

          {usedStatus && (
            <FormSection>
              {!usedStatus.used && (
                <FormItem>
                  <FormButton
                    disabled={isProgressForUsedStatus || !canUseTicket}
                    onClick={() => updateTicketUsedStatus(true)}>
                    <IconLabel
                      icon={<MdCheck />}
                      label="使用済みにする" />
                  </FormButton>
                </FormItem>
              )}
              {usedStatus.used && (
                <>
                  <Alert
                    title="このチケットは使用済みです。"
                    type="warning" />
                  <FormButton
                    color="default"
                    onClick={() => handleReset(true)}>
                    <IconLabel
                      icon={<MdRefresh />}
                      label="読み取りリセット" />
                  </FormButton>
                </>
              )}
            </FormSection>
          )}

          {usedStatusError && (
            <Alert
              title="エラーが発生しました"
              type="error">
              {usedStatusError}
            </Alert>
          )}

          <table>
            <tbody>
              <tr>
                <th>参加種別</th>
                <td>{(type && (
                  <TicketTypeLabel
                    store={store}
                    typeId={type.id} />
                )) ?? <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>使用ステータス</th>
                <td>
                  {ticketUser !== undefined && ticketUser !== null
                    ? <TicketUsedStatusLabel used={ticketUser?.used} />
                    : <BlinkField />}
                </td>
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
              {commonRole && commonRole >= 2 && (
                <>
                  <tr>
                    <th>購入者</th>
                    <td>
                      {ticket
                        ? ticket.isStandalone
                          ? 'スタンドアロン'
                          : ticketUser !== undefined && ownerUser !== null && ownerUser?.name
                        : <BlinkField />}
                    </td>
                  </tr>
                  <tr>
                    <th>使用者</th>
                    <td>
                      {ticket
                        ? ticket.isStandalone
                          ? 'スタンドアロン'
                          : ticketUser !== undefined && usableUser !== null && usableUser?.name
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
                </>
              )}
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
