import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MdLocalPlay } from 'react-icons/md'
import {
  type SockbaseTicketMeta,
  type SockbaseAccount,
  type SockbaseStoreDocument,
  type SockbaseTicketDocument,
  type SockbasePaymentDocument,
  type SockbaseTicketHashIdDocument,
  type SockbaseTicketUsedStatus,
  type SockbaseTicketUserDocument
} from 'sockbase'
import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import PageTitle from '../../../components/Layout/Dashboard/PageTitle'
import TwoColumnsLayout from '../../../components/Layout/TwoColumns/TwoColumns'
import CopyToClipboard from '../../../components/Parts/CopyToClipboard'
import BlinkField from '../../../components/Parts/BlinkField'
import useStore from '../../../hooks/useStore'
import useDayjs from '../../../hooks/useDayjs'
import useUserData from '../../../hooks/useUserData'
import usePayment from '../../../hooks/usePayment'
import PaymentStatusLabel from '../../../components/Parts/StatusLabel/PaymentStatusLabel'
import FormSection from '../../../components/Form/FormSection'
import FormItem from '../../../components/Form/FormItem'
import FormButton from '../../../components/Form/Button'
import FormInput from '../../../components/Form/Input'
import LinkButton from '../../../components/Parts/LinkButton'
import LoadingCircleWrapper from '../../../components/Parts/LoadingCircleWrapper'
import TicketUsedStatusLabel from '../../../components/Parts/StatusLabel/TicketUsedStatusLabel'
import ApplicationStatusLabel from '../../../components/Parts/StatusLabel/ApplicationStatusLabel'

const TicketDetail: React.FC = () => {
  const { hashedTicketId } = useParams<{ hashedTicketId: string }>()
  const { formatByDate } = useDayjs()
  const {
    getTicketIdByHashIdAsync,
    getTicketByIdAsync,
    getStoreByIdAsync,
    getTicketMetaByIdAsync,
    getTicketUserByHashIdAsync,
    getTicketUsedStatusByIdAsync,
    assignTicketUserAsync,
    unassignTicketUserAsync
  } = useStore()
  const { getUserDataByUserIdAndStoreIdOptionalAsync } = useUserData()
  const { getPaymentAsync } = usePayment()

  const [ticketHash, setTicketHash] = useState<SockbaseTicketHashIdDocument>()
  const [ticket, setTicket] = useState<SockbaseTicketDocument>()
  const [store, setStore] = useState<SockbaseStoreDocument>()
  const [userData, setUserData] = useState<SockbaseAccount | null>()
  const [ticketMeta, setTicketMeta] = useState<SockbaseTicketMeta>()
  const [payment, setPayment] = useState<SockbasePaymentDocument>()
  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument>()
  const [ticketUsedStatus, setTicketUsedStatus] = useState<SockbaseTicketUsedStatus>()

  const [openAssignPanel, setOpenAssignPanel] = useState(false)
  const [isProgressForAssignMe, setProgressForAssignMe] = useState(false)
  const [isProgressForUnassign, setProgressForUnassign] = useState(false)

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!hashedTicketId) return

      getTicketIdByHashIdAsync(hashedTicketId)
        .then(fetchedTicketHash => setTicketHash(fetchedTicketHash))
        .catch(err => { throw err })

      getTicketUserByHashIdAsync(hashedTicketId)
        .then(fetchedTicketUser => setTicketUser(fetchedTicketUser))
        .catch(err => { throw err })
    }

    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [hashedTicketId])

  const onFetchedTicketHash = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!ticketHash) return
      getTicketByIdAsync(ticketHash.ticketId)
        .then(fetchedTicket => setTicket(fetchedTicket))
        .catch(err => { throw err })

      getTicketMetaByIdAsync(ticketHash.ticketId)
        .then(fetchedTicketMeta => setTicketMeta(fetchedTicketMeta))
        .catch(err => { throw err })

      getTicketUsedStatusByIdAsync(ticketHash.ticketId)
        .then(fetchedTicketUsedStatus => setTicketUsedStatus(fetchedTicketUsedStatus))
        .catch(err => { throw err })

      if (!ticketHash.paymentId) return
      getPaymentAsync(ticketHash.paymentId)
        .then(fetchedPayment => setPayment(fetchedPayment))
        .catch(err => { throw err })
    }

    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onFetchedTicketHash, [ticketHash])

  const onFetchedTicket = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!ticket?.id) return

      getStoreByIdAsync(ticket.storeId)
        .then(fetchedStore => setStore(fetchedStore))
        .catch(err => { throw err })

      getUserDataByUserIdAndStoreIdOptionalAsync(ticket.userId, ticket.storeId)
        .then(fetchedUserData => setUserData(fetchedUserData))
        .catch(err => { throw err })
    }

    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onFetchedTicket, [ticket])

  const type = useMemo(() => {
    if (!store || !ticket) return
    return store.types
      .filter(t => t.id === ticket.typeId)[0]
  }, [store, ticket])

  const pageTitle = useMemo(() => {
    if (!store || !type) return undefined
    return `${store.storeName} (${type.name})`
  }, [store, type])

  const assignURL = useMemo(() =>
    ticketHash && `${location.protocol}//${location.host}/assign-tickets?thi=${ticketHash.hashId}` || '',
    [ticketHash])

  const handleAssignMe = (): void => {
    if (!ticket || !ticketHash) return
    setProgressForAssignMe(true)

    assignTicketUserAsync(ticket.userId, ticketHash.hashId)
      .then(() => {
        alert('割り当てに成功しました。')
        setTicketUser(s => (s && { ...s, usableUserId: ticket.userId }))
      })
      .catch(err => {
        alert('割り当て時にエラーが発生しました')
        throw err
      })
      .finally(() => setProgressForAssignMe(false))
  }

  const handleUnassign = (): void => {
    if (!ticketHash) return
    if (!confirm('チケットの割り当てを解除します。\nよろしいですか？')) return

    setProgressForUnassign(true)

    unassignTicketUserAsync(ticketHash.hashId)
      .then(() => {
        alert('割り当て解除に成功しました。')
        setTicketUser(s => (s && { ...s, usableUserId: null }))
      })
      .catch(err => {
        alert('割り当て解除に失敗しました')
        throw err
      })
      .finally(() => setProgressForUnassign(false))

  }

  return (
    <DashboardLayout title={ticket && store ? (pageTitle ?? '') : 'チケット詳細'}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/tickets">購入済みチケット一覧</Link></li>
      </Breadcrumbs>
      <PageTitle title={pageTitle} icon={<MdLocalPlay />} description="購入済みチケット情報" isLoading={!store} />

      <TwoColumnsLayout>
        <>
          <h3>ステータス</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込み状況</th>
                <td>
                  {(ticketMeta?.applicationStatus !== undefined
                    && <ApplicationStatusLabel status={ticketMeta?.applicationStatus} />)
                    || <BlinkField />}
                </td>
              </tr>
              {type?.productInfo && <tr>
                <th>お支払い状況</th>
                <td>
                  {(payment?.status !== undefined
                    && <Link to="/dashboard/payments">
                      <PaymentStatusLabel status={payment.status} />
                    </Link>)
                    || <BlinkField />}
                </td>
              </tr>}
              <tr>
                <th>割り当て状況</th>
                <td>{(ticketUser && (ticketUser.usableUserId ? '割り当て済み' : '未割り当て')) ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>使用状況</th>
                <td>{(ticketUsedStatus && <TicketUsedStatusLabel status={ticketUsedStatus.used} />) ?? <BlinkField />}</td>
              </tr>
            </tbody>
          </table>

          <h3>購入者情報</h3>
          <table>
            <tbody>
              <tr>
                <th>購入者氏名</th>
                <td>
                  {userData !== undefined
                    ? userData?.name || '-'
                    : <BlinkField />}
                </td>
              </tr>
              <tr>
                <th>メールアドレス</th>
                <td>
                  {userData !== undefined
                    ? userData?.email || '-'
                    : <BlinkField />}
                </td>
              </tr>
            </tbody>
          </table>

          <h3>チケット情報</h3>
          <table>
            <tbody>
              <tr>
                <th>チケットID</th>
                <td>{hashedTicketId} <CopyToClipboard content={hashedTicketId ?? ''} /></td>
              </tr>
              <tr>
                <th>申し込み日時</th>
                <td>{(ticket?.createdAt && formatByDate(ticket.createdAt, 'YYYY年M月D日 H時mm分ss秒')) ?? <BlinkField />}</td>
              </tr>
            </tbody>
          </table>
        </>

        <>
          {ticketUser && !ticketUser.usableUserId && ticketUsedStatus && !ticketUsedStatus?.used && <>
            <h3>チケット割り当て</h3>
            <p>
              このチケットを使う人を選択してください。
            </p>
            <FormSection>
              <FormItem>
                <LoadingCircleWrapper isLoading={isProgressForAssignMe}>
                  <FormButton onClick={handleAssignMe} disabled={isProgressForAssignMe}>自分で使う</FormButton>
                </LoadingCircleWrapper>
              </FormItem>
              <FormItem>
                <FormButton color="default" onClick={() => setOpenAssignPanel(s => !s)}>他の方へ割り当てる</FormButton>
              </FormItem>
              {openAssignPanel && <>
                <FormItem>
                  チケットを渡したい方へ以下のURLを送付してください。
                </FormItem>
                <FormItem>
                  <FormInput disabled value={assignURL} />
                </FormItem>
              </>}
            </FormSection>
          </>}

          {hashedTicketId && ticket && ticketUser && ticketUser.usableUserId === ticket.userId && <>
            <h3>チケットを表示</h3>
            <FormSection>
              <FormItem>
                <LinkButton to={`/tickets/${hashedTicketId}`}>チケットを表示</LinkButton>
              </FormItem>
            </FormSection>
          </>}

          {ticketUser?.usableUserId && ticket && <FormSection>
            <h3>チケット割り当てを解除</h3>
            <FormItem>
              このチケットは{ticketUser.usableUserId === ticket.userId ? 'あなた' : '他の方'}に割り当てられています。
            </FormItem>
            <FormItem>
              <LoadingCircleWrapper isLoading={isProgressForUnassign}>
                <FormButton color="danger" onClick={handleUnassign} disabled={isProgressForUnassign}>チケットの割り当てを解除する</FormButton>
              </LoadingCircleWrapper>
            </FormItem>
          </FormSection>}
        </>
      </TwoColumnsLayout>
    </DashboardLayout>
  )
}

export default TicketDetail
