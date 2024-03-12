import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { IconMDesktopComputer } from 'react-fluentui-emoji/lib/modern'
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
import NGSound from '../../assets/se/ng.mp3'
import OKSound from '../../assets/se/ok.mp3'
import FormButton from '../../components/Form/Button'
import FormCheckbox from '../../components/Form/Checkbox'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import FormInput from '../../components/Form/Input'
import FormLabel from '../../components/Form/Label'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import Alert from '../../components/Parts/Alert'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import ApplicationStatusLabel from '../../components/Parts/StatusLabel/ApplicationStatusLabel'
import PaymentStatusLabel from '../../components/Parts/StatusLabel/PaymentStatusLabel'
import StoreTypeLabel from '../../components/Parts/StatusLabel/StoreTypeLabel'
import TicketUsedStatusLabel from '../../components/Parts/StatusLabel/TicketUsedStatusLabel'
import useDayjs from '../../hooks/useDayjs'
import useFirebaseError from '../../hooks/useFirebaseError'
import usePayment from '../../hooks/usePayment'
import useQRReader from '../../hooks/useQRReader'
import useStore from '../../hooks/useStore'
import useUserData from '../../hooks/useUserData'
import useValidate from '../../hooks/useValidate'

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
  const { data: qrData, QRReaderComponent } = useQRReader()
  const validator = useValidate()

  const [playSEOK] = useSound(OKSound)
  const [playSENG] = useSound(NGSound)

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

  const searchTicketAsync = async (hashId: string): Promise<void> => {
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
  }
  useEffect(onScan, [qrData])

  const handleSearch = (): void => {
    if (!ticketHashId) return
    searchTicketAsync(ticketHashId)
      .catch(err => { throw err })
  }

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
    <DashboardBaseLayout title="チケット照会ターミナル" requireCommonRole={1}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle title="チケット照会ターミナル" icon={<IconMDesktopComputer />} description="チケット管理" />

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

          <FormSection>
            <FormItem>
              <FormLabel>チケットID</FormLabel>
              <FormInput
                value={ticketHashId}
                onChange={e => setTicketHashId(e.target.value)}
                placeholder="チケットID" />
            </FormItem>
            <FormItem>
              <FormButton onClick={handleSearch} disabled={!ticketHashId}>照会</FormButton>
            </FormItem>
          </FormSection>
          {ticketUser === null && <Alert type="danger" title="チケット情報が見つかりませんでした">
            正しいチケットIDを入力してください。
          </Alert>}

          {isActiveQRReader && <ReaderWrap>
            <QRReaderComponent />
          </ReaderWrap>}

        </>

        <>
          {ticketUser && <>
            <h2>チケット情報</h2>
            {ticketMeta && type &&
              (ticketMeta.applicationStatus !== 2 || !ticketUser.usableUserId || (type.productInfo && payment?.status !== 1)) &&
              <Alert type="danger" title="このチケットは使用できません。">
                <ul>
                  {ticketMeta.applicationStatus !== 2 && <li>申し込みが確定していません。</li>}
                  {!ticketUser.usableUserId && <li>チケットの割り当てが行われていません。</li>}
                  {type.productInfo && payment?.status !== 1 && <li>支払いが完了していません。</li>}
                </ul>
              </Alert>}

            {usedStatus &&
              <FormSection>
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
                      ? (ticketUser?.usedAt && formatByDate(ticketUser.usedAt, 'YYYY年M月D日 H時mm分')) || '未使用'
                      : <BlinkField />}
                  </td>
                </tr>
              </tbody>
            </table>
          </>}
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
