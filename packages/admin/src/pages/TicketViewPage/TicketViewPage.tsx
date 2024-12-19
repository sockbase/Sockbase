import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdCheck, MdClose, MdOutlineDeleteForever, MdPendingActions, MdWallet } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import sockbaseShared from 'shared'
import FormButton from '../../components/Form/FormButton'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import CopyToClipboard from '../../components/Parts/CopyToClipboard'
import IconLabel from '../../components/Parts/IconLabel'
import PageTitle from '../../components/Parts/PageTitle'
import PaymentStatusController from '../../components/Parts/PaymentStatusController'
import ApplicationStatusLabel from '../../components/StatusLabel/ApplicationStatusLabel'
import PaymentStatusLabel from '../../components/StatusLabel/PaymentStatusLabel'
import TicketAssignStatusLabel from '../../components/StatusLabel/TicketAssignStatusLabel'
import TicketUsedStatusLabel from '../../components/StatusLabel/TicketUsedStatusLabel'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import usePayment from '../../hooks/usePayment'
import useRole from '../../hooks/useRole'
import useStore from '../../hooks/useStore'
import useUserData from '../../hooks/useUserData'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type {
  SockbaseTicketHashIdDocument,
  SockbaseStoreDocument,
  SockbaseTicketDocument,
  SockbaseTicketUsedStatus,
  SockbaseTicketUserDocument,
  SockbaseTicketMeta,
  SockbaseAccount,
  SockbaseApplicationStatus,
  SockbasePaymentDocument
} from 'sockbase'

const TicketViewPage: React.FC = () => {
  const { hashId } = useParams()

  const {
    getTicketIdByHashIdAsync,
    getTicketByIdAsync,
    getStoreByIdAsync,
    getTicketMetaByIdAsync,
    getTicketUsedStatusByIdAsync,
    getTicketUserByHashIdAsync,
    setTicketApplicationStatusAsync,
    deleteTicketAsync,
    updateTicketUsedStatusByIdAsync
  } = useStore()
  const { getPaymentByIdAsync } = usePayment()
  const { getUserDataByUserIdAndStoreIdAsync } = useUserData()
  const { isSystemAdmin } = useRole()

  const [ticketHash, setTicketHash] = useState<SockbaseTicketHashIdDocument>()
  const [ticket, setTicket] = useState<SockbaseTicketDocument>()
  const [ticketMeta, setTicketMeta] = useState<SockbaseTicketMeta>()
  const [ticketUsed, setTicketUsed] = useState<SockbaseTicketUsedStatus>()
  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument>()
  const [userData, setUserData] = useState<SockbaseAccount | null>()
  const [ticketUserData, setTicketUserData] = useState<SockbaseAccount | null>()
  const [store, setStore] = useState<SockbaseStoreDocument>()
  const [payment, setPayment] = useState<SockbasePaymentDocument | null>()

  const [isDeletedTicket, setIsDeletedTicket] = useState(false)

  const ticketType = useMemo(() => {
    return store?.types.find(type => type.id === ticket?.typeId)
  }, [ticket, store])

  const pageTitle = useMemo(() => {
    if (!store || !ticketType) return undefined
    return `${store.name} (${ticketType.name})`
  }, [store, ticketType])

  const handleSetApplicationStatus = useCallback((status: SockbaseApplicationStatus) => {
    if (!ticketHash) return
    if (!confirm(`申し込み状態を ${sockbaseShared.constants.application.statusText[status]} に変更します。\nよろしいですか？`)) return
    setTicketApplicationStatusAsync(ticketHash.ticketId, status)
      .then(() => {
        setTicketMeta(s => s && ({ ...s, applicationStatus: status }))
        alert('申し込み状態を変更しました')
      })
      .catch(err => { throw err })
  }, [ticketHash])

  const handleDeleteApplication = useCallback(() => {
    if (!hashId) return

    const promptAppId = prompt(`この申し込みを削除するには ${hashId} と入力してください`)
    if (promptAppId === null) {
      return
    }
    else if (promptAppId !== hashId) {
      alert('入力が間違っています')
      return
    }

    if (!confirm('※不可逆的操作です※\nこの申し込みを削除します。\nよろしいですか？')) return

    deleteTicketAsync(hashId)
      .then(() => {
        setIsDeletedTicket(true)
        alert('削除が完了しました')
      })
      .catch(err => {
        alert('削除する際にエラーが発生しました')
        throw err
      })
  }, [hashId])

  const handleSetTicketUsed = useCallback((used: boolean) => {
    if (!ticketHash) return
    updateTicketUsedStatusByIdAsync(ticketHash?.ticketId, used)
      .then(() => {
        setTicketUsed(s => s && ({ ...s, used }))
        alert('使用状況を変更しました')
      })
      .catch(err => { throw err })
  }, [ticketHash])

  useEffect(() => {
    if (!hashId) return
    getTicketIdByHashIdAsync(hashId)
      .then(setTicketHash)
      .catch(err => { throw err })
  }, [hashId])

  useEffect(() => {
    if (!ticketHash) return
    getTicketByIdAsync(ticketHash.ticketId)
      .then(setTicket)
      .catch(err => { throw err })
    getTicketMetaByIdAsync(ticketHash.ticketId)
      .then(setTicketMeta)
      .catch(err => { throw err })
    getTicketUsedStatusByIdAsync(ticketHash.ticketId)
      .then(setTicketUsed)
      .catch(err => { throw err })
    getTicketUserByHashIdAsync(ticketHash.hashId)
      .then(setTicketUser)
      .catch(err => { throw err })

    if (ticketHash.paymentId) {
      getPaymentByIdAsync(ticketHash.paymentId)
        .then(setPayment)
        .catch(err => { throw err })
    }
    else {
      setPayment(null)
    }
  }, [ticketHash])

  useEffect(() => {
    if (!ticket) return
    getStoreByIdAsync(ticket.storeId)
      .then(setStore)
      .catch(err => { throw err })
    if (ticket.userId) {
      getUserDataByUserIdAndStoreIdAsync(ticket.userId, ticket.storeId)
        .then(setUserData)
        .catch(err => { throw err })
    }
    else {
      setUserData(null)
    }
  }, [ticket])

  useEffect(() => {
    if (!ticketUser) return
    if (ticketUser.usableUserId) {
      getUserDataByUserIdAndStoreIdAsync(ticketUser.usableUserId, ticketUser.storeId)
        .then(setTicketUserData)
        .catch(err => { throw err })
    }
    else {
      setTicketUserData(null)
    }
  }, [ticketUser])

  return (
    <DefaultLayout
      requireCommonRole={2}
      title={pageTitle ?? 'チケット情報照会'}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/stores">チケットストア一覧</Link></li>
        <li>{store?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/stores/${store?.id}`}>{store?.name ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdWallet />}
        isLoading={!pageTitle}
        title={pageTitle} />

      <TwoColumnLayout>
        <>
          <h3>ステータス</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込み状況</th>
                <td><ApplicationStatusLabel status={ticketMeta?.applicationStatus} /></td>
              </tr>
              <tr>
                <th>お支払い状況</th>
                <td>
                  {
                    payment === undefined
                      ? <BlinkField />
                      : payment === null
                        ? '支払い必要なし'
                        : (
                          <PaymentStatusLabel
                            isShowBrand
                            payment={payment} />
                        )
                  }
                </td>
              </tr>
              <tr>
                <th>割り当て状況</th>
                <td>
                  <TicketAssignStatusLabel
                    isStandalone={ticket?.isStandalone}
                    usableUserId={ticketUser?.usableUserId} />
                </td>
              </tr>
              <tr>
                <th>使用状況</th>
                <td><TicketUsedStatusLabel used={ticketUsed?.used} /></td>
              </tr>
            </tbody>
          </table>
        </>
        <>
          <h3>購入・使用者情報</h3>
          <table>
            <tbody>
              <tr>
                <th>スタンドアロン？</th>
                <td>{ticket ? ticket?.isStandalone ? 'はい' : 'いいえ' : <BlinkField />}</td>
              </tr>
              <tr>
                <th>購入者氏名</th>
                <td>{(!ticket?.isStandalone && userData?.name) || '---'}</td>
              </tr>
              <tr>
                <th>購入者メールアドレス</th>
                <td>{(!ticket?.isStandalone && userData?.email) || '---'}</td>
              </tr>
              <tr>
                <th>使用者氏名</th>
                <td>
                  {ticket
                    ? !ticket.isStandalone
                      ? ticketUserData
                        ? ticketUserData.name
                        : '未割当'
                      : '---'
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>使用者メールアドレス</th>
                <td>
                  {ticket
                    ? !ticket.isStandalone
                      ? ticketUserData
                        ? ticketUserData.email
                        : '未割当'
                      : '---'
                    : <BlinkField />}
                </td>
              </tr>
            </tbody>
          </table>
        </>
        <>
          <h3>基礎情報</h3>
          <table>
            <tbody>
              <tr>
                <th>ID</th>
                <td>{ticket?.hashId ?? <BlinkField />} <CopyToClipboard content={ticket?.hashId} /></td>
              </tr>
              <tr>
                <th>内部 ID</th>
                <td>{ticket?.id ?? <BlinkField />} <CopyToClipboard content={ticket?.id} /></td>
              </tr>
              <tr>
                <th>決済 ID</th>
                <td>{payment !== undefined ? payment?.id ?? '支払い必要なし' : <BlinkField />} <CopyToClipboard content={payment?.id} /></td>
              </tr>
            </tbody>
          </table>
        </>
      </TwoColumnLayout>
      <TwoColumnLayout>
        <>
          <h3>申し込みステータス変更</h3>
          <FormSection>
            <FormItem $inlined>
              {ticketMeta?.applicationStatus !== 2 && (
                <FormButton onClick={() => handleSetApplicationStatus(2)}>
                  <IconLabel
                    icon={<MdCheck />}
                    label="申し込み確定状態にする" />
                </FormButton>
              )}
              {ticketMeta?.applicationStatus !== 0 && (
                <FormButton onClick={() => handleSetApplicationStatus(0)}>
                  <IconLabel
                    icon={<MdPendingActions />}
                    label="仮申し込み状態にする" />
                </FormButton>
              )}
              {ticketMeta?.applicationStatus !== 1 && (
                <FormButton onClick={() => handleSetApplicationStatus(1)}>
                  <IconLabel
                    icon={<MdClose />}
                    label="キャンセル状態にする" />
                </FormButton>
              )}
            </FormItem>
          </FormSection>

          <h3>使用済みステータス変更</h3>
          {ticketUsed
            ? (
              <>
                <FormSection>
                  <FormItem>
                    <FormButton onClick={() => handleSetTicketUsed(!ticketUsed.used)}>
                      <IconLabel
                        icon={ticketUsed.used ? <MdPendingActions /> : <MdCheck />}
                        label={ticketUsed.used ? '未使用にする' : '使用済みにする'} />
                    </FormButton>
                  </FormItem>
                </FormSection>
              </>
            )
            : <BlinkField />}

          <PaymentStatusController
            onChange={st => {
              setPayment(s => s && ({ ...s, status: st }))
              alert('支払いステータスを変更しました')
            }}
            paymentId={ticketHash?.paymentId}
            status={payment?.status} />
        </>
        {isSystemAdmin && (
          <>
            <h3>システム操作</h3>
            <FormSection>
              <FormItem>
                <FormButton
                  disabled={isDeletedTicket}
                  onClick={handleDeleteApplication}>
                  <IconLabel
                    icon={<MdOutlineDeleteForever />}
                    label="申し込み情報を削除する" />
                </FormButton>
              </FormItem>
            </FormSection>
          </>
        )}
      </TwoColumnLayout>
    </DefaultLayout>
  )
}

export default TicketViewPage
