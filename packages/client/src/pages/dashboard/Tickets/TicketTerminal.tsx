import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { MdQrCodeScanner } from 'react-icons/md'
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
import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import PageTitle from '../../../components/Layout/Dashboard/PageTitle'
import TwoColumnsLayout from '../../../components/Layout/TwoColumns/TwoColumns'
import FormSection from '../../../components/Form/FormSection'
import FormItem from '../../../components/Form/FormItem'
import FormLabel from '../../../components/Form/Label'
import FormInput from '../../../components/Form/Input'
import FormButton from '../../../components/Form/Button'
import useStore from '../../../hooks/useStore'
import useDayjs from '../../../hooks/useDayjs'
import usePayment from '../../../hooks/usePayment'
import useUserData from '../../../hooks/useUserData'
import Alert from '../../../components/Parts/Alert'
import BlinkField from '../../../components/Parts/BlinkField'
import useFirebaseError from '../../../hooks/useFirebaseError'
import useQRReader from '../../../hooks/useQRReader'
import FormCheckbox from '../../../components/Form/Checkbox'
import StoreTypeLabel from '../../../components/Parts/StatusLabel/StoreTypeLabel'
import ApplicationStatusLabel from '../../../components/Parts/StatusLabel/ApplicationStatusLabel'
import PaymentStatusLabel from '../../../components/Parts/StatusLabel/PaymentStatusLabel'
import TicketUsedStatusLabel from '../../../components/Parts/StatusLabel/TicketUsedStatusLabel'

const TicketTerminal: React.FC = () => {
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
  const { data: qrData, QRReaderComponent } = useQRReader()

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
  const [isHoldQRReader, setHoldQRReader] = useState(true)

  const onChangedHashId = (): void => {
    if (ticketHashId) return

    setUsedStatusError(undefined)
    setStore(undefined)
    setTicketHash(undefined)
    setUsedStatus(undefined)
    setTicketMeta(undefined)
    setTicket(undefined)
    setPayment(undefined)
    setOwnerUser(undefined)
    setUsableUser(undefined)
  }
  useEffect(onChangedHashId, [ticketHashId])

  const searchTicket = (hashId: string): void => {
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
  }

  const onFetchedTicketHash = (): void => {
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
  }
  useEffect(onFetchedTicketHash, [ticketHash])

  const onFetchedTicket = (): void => {
    if (!ticket) return

    getUserDataByUserIdAndStoreIdAsync(ticket.userId, ticket.storeId)
      .then(fetchedUser => setOwnerUser(fetchedUser))
      .catch(err => { throw err })
  }
  useEffect(onFetchedTicket, [ticket])

  const updateTicketUsedStatus = (used: boolean): void => {
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
  }

  const onScan = (): void => {
    if (!qrData) return
    setTicketHashId(qrData)
    searchTicket(qrData)

    if (isHoldQRReader) return
    setActiveQRReader(false)
  }
  useEffect(onScan, [qrData])

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

  return (
    <DashboardLayout title="チケット照会ターミナル">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle title="チケット照会ターミナル" icon={<MdQrCodeScanner />} description="チケット管理" />

      <TwoColumnsLayout>
        <>
          <FormSection>
            <FormItem>
              <FormCheckbox
                name="isActiveQRReader"
                label="QRリーダーを開く"
                checked={isActiveQRReader}
                onChange={(c) => setActiveQRReader(c)} />
            </FormItem>
            {isActiveQRReader && <FormItem>
              <FormCheckbox
                name="isHoldQRReader"
                label="読み取り後にQRリーダを保持する"
                checked={isHoldQRReader}
                onChange={(c) => setHoldQRReader(c)} />
            </FormItem>}
          </FormSection>

          {isActiveQRReader && <ReaderWrap>
            <QRReaderComponent />
          </ReaderWrap>}

          <FormSection>
            <FormItem>
              <FormLabel>チケットID</FormLabel>
              <FormInput
                value={ticketHashId}
                onChange={e => setTicketHashId(e.target.value)}
                placeholder="20231104235959999-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                disabled={isActiveQRReader} />
            </FormItem>
            {!isActiveQRReader && <FormItem>
              <FormButton onClick={() => searchTicket(ticketHashId)} disabled={!ticketHashId}>照会</FormButton>
            </FormItem>}
          </FormSection>
          {ticketUser === null && <Alert type="danger" title="チケット情報が見つかりませんでした">
            正しいチケットIDを入力してください。
          </Alert>}
        </>

        <>
          {ticketUser && <>
            {ticketMeta && type
              && (ticketMeta.applicationStatus !== 2 || !ticketUser.usableUserId || (type.productInfo && payment?.status !== 1))
              && <Alert type="danger" title="このチケットは使用できません。">
                <ul>
                  {ticketMeta.applicationStatus !== 2 && <li>申し込みが確定していません。</li>}
                  {!ticketUser.usableUserId && <li>チケットの割り当てが行われていません。</li>}
                  {type.productInfo && payment?.status !== 1 && <li>支払いが完了していません。</li>}
                </ul>
              </Alert>}

            {usedStatus
              && <FormSection>
                {!usedStatus.used
                  ? <FormItem>
                    <FormButton onClick={() => updateTicketUsedStatus(true)} disabled={isProgressForUsedStatus || !canUseTicket}>
                      使用済みにする
                    </FormButton>
                  </FormItem>
                  : <FormItem>
                    <FormButton onClick={() => updateTicketUsedStatus(false)} color="default" disabled={isProgressForUsedStatus}>
                      未使用にする
                    </FormButton>
                  </FormItem>}
              </FormSection>}
            {usedStatusError && <Alert type="danger" title="エラーが発生しました">
              {usedStatusError}
            </Alert>}

            <table>
              <tbody>
                <tr>
                  <th>チケットストア</th>
                  <td>{store !== null ? store?.storeName : <BlinkField />}</td>
                </tr>
                <tr>
                  <th>参加種別</th>
                  <td>{(type && <StoreTypeLabel type={type} />) ?? <BlinkField />}</td>
                </tr>
                <tr>
                  <th>申し込みステータス</th>
                  <td>
                    {ticketMeta !== null
                      ? <ApplicationStatusLabel status={ticketMeta?.applicationStatus} />
                      : <BlinkField />}
                  </td>
                </tr>
                {type?.productInfo
                  && <tr>
                    <th>決済状況</th>
                    <td>
                      {payment !== null
                        ? <PaymentStatusLabel status={payment?.status} />
                        : <BlinkField />}
                    </td>
                  </tr>}
                <tr>
                  <th>申し込み日時</th>
                  <td>
                    {ticket !== null
                      ? ticket?.createdAt && formatByDate(ticket.createdAt, 'YYYY年M月D日 H時mm分')
                      : <BlinkField />}
                  </td>
                </tr>
                <tr>
                  <th>購入者</th>
                  <td>{ownerUser !== null ? ownerUser?.name : <BlinkField />}</td>
                </tr>
              </tbody>
            </table>
            <table>
              <tbody>
                <tr>
                  <th>使用ステータス</th>
                  <td>
                    {ticketUser !== null
                      ? <TicketUsedStatusLabel status={ticketUser.used} />
                      : <BlinkField />}
                  </td>
                </tr>
                <tr>
                  <th>使用者</th>
                  <td>{usableUser !== null ? usableUser?.name : <BlinkField />}</td>
                </tr>
                <tr>
                  <th>使用日時</th>
                  <td>
                    {ticketUser !== null
                      ? ticketUser?.usedAt && formatByDate(ticketUser.usedAt, 'YYYY年M月D日 H時mm分') || '未使用'
                      : <BlinkField />}
                  </td>
                </tr>
              </tbody>
            </table>
          </>}
        </>
      </TwoColumnsLayout>
    </DashboardLayout >
  )
}

export default TicketTerminal

const ReaderWrap = styled.div`
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
`