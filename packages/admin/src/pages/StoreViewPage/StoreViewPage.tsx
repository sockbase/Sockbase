import { useCallback, useEffect, useState } from 'react'
import {
  MdAddCircleOutline,
  MdDataset,
  MdOpenInNew,
  MdRefresh,
  MdStore
} from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormButton from '../../components/Form/FormButton'
import FormCheck from '../../components/Form/FormCheck'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import AnchorButton from '../../components/Parts/AnchorButton'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import LinkButton from '../../components/Parts/LinkButton'
import PageTitle from '../../components/Parts/PageTitle'
import ApplicationStatusLabel from '../../components/StatusLabel/ApplicationStatusLabel'
import PaymentStatusLabel from '../../components/StatusLabel/PaymentStatusLabel'
import TicketAssignStatusLabel from '../../components/StatusLabel/TicketAssignStatusLabel'
import TicketTypeLabel from '../../components/StatusLabel/TicketTypeLabel'
import TicketUsedStatusLabel from '../../components/StatusLabel/TicketUsedStatusLabel'
import envHelper from '../../helpers/envHelper'
import useDayjs from '../../hooks/useDayjs'
import usePayment from '../../hooks/usePayment'
import useStore from '../../hooks/useStore'
import useUserData from '../../hooks/useUserData'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type {
  SockbaseAccount,
  SockbasePaymentDocument,
  SockbaseStoreDocument,
  SockbaseTicketDocument,
  SockbaseTicketHashIdDocument,
  SockbaseTicketMeta,
  SockbaseTicketUsedStatus,
  SockbaseTicketUser
} from 'sockbase'

const StoreViewPage: React.FC = () => {
  const { storeId } = useParams()

  const { formatByDate } = useDayjs()
  const {
    getStoreByIdAsync,
    getTicketsByStoreIdAsync,
    getTicketMetaByIdAsync,
    getTicketUserByHashIdAsync,
    getTicketUsedStatusByIdAsync,
    getTicketIdByHashIdAsync
  } = useStore()
  const { getPaymentByIdAsync } = usePayment()
  const { getUserDataByUserIdAndStoreIdAsync } = useUserData()

  const [store, setStore] = useState<SockbaseStoreDocument>()
  const [tickets, setTickets] = useState<SockbaseTicketDocument[]>()
  const [ticketMetas, setTicketMetas] = useState<Record<string, SockbaseTicketMeta>>()
  const [ticketHashes, setTicketHashes] = useState<SockbaseTicketHashIdDocument[]>()
  const [ticketUsers, setTicketUsers] = useState<Record<string, SockbaseTicketUser>>()
  const [ticketUsedStatuses, setTicketUsedStatuses] = useState<Record<string, SockbaseTicketUsedStatus>>()
  const [userDataSet, setUserDataSet] = useState<Record<string, SockbaseAccount>>()
  const [payments, setPayments] = useState<Record<string, SockbasePaymentDocument | null>>()

  const handleRefresh = useCallback((storeId: string) => {
    setTickets(undefined)
    getTicketsByStoreIdAsync(storeId)
      .then(setTickets)
      .catch(err => { throw err })
  }, [])

  useEffect(() => {
    if (!storeId) return

    setStore(undefined)
    getStoreByIdAsync(storeId)
      .then(setStore)
      .catch(err => { throw err })

    handleRefresh(storeId)
  }, [storeId])

  useEffect(() => {
    if (!tickets) return

    const ticketIds = tickets.map(ticket => ticket.id)
    Promise.all(ticketIds.map(async id => ({
      id,
      data: await getTicketMetaByIdAsync(id)
    })))
      .then(fetchedTicketMetas => {
        setTicketMetas(fetchedTicketMetas.reduce((p, c) => ({ ...p, [c.id]: c.data }), {}))
      })
      .catch(err => { throw err })
    Promise.all(ticketIds.map(async id => ({
      id,
      data: await getTicketUsedStatusByIdAsync(id)
    })))
      .then(fetchedTicketUsedStatuses => {
        setTicketUsedStatuses(fetchedTicketUsedStatuses.reduce((p, c) => ({ ...p, [c.id]: c.data }), {}))
      })
      .catch(err => { throw err })

    const ticketHashIds = tickets.map(ticket => ticket.hashId ?? '')
    Promise.all(ticketHashIds.map(getTicketIdByHashIdAsync))
      .then(setTicketHashes)
      .catch(err => { throw err })
    Promise.all(ticketHashIds.map(async hashId => ({
      hashId,
      data: await getTicketUserByHashIdAsync(hashId)
    })))
      .then(fetchedTicketUsers => {
        setTicketUsers(fetchedTicketUsers.reduce((p, c) => ({ ...p, [c.hashId]: c.data }), {}))
      })
      .catch(err => { throw err })
  }, [tickets])

  useEffect(() => {
    if (!storeId || !tickets || !ticketUsers) return
    const userIds = [...tickets.map(ticket => ticket.userId), ...Object.values(ticketUsers).map(user => user.userId)]
    const userIdSet = [...new Set(userIds)]
    Promise.all(userIdSet.map(async userId => ({
      userId,
      data: await getUserDataByUserIdAndStoreIdAsync(userId, storeId)
    })))
      .then(userDataSet => setUserDataSet(userDataSet.reduce((p, c) => ({ ...p, [c.userId]: c.data }), {})))
      .catch(err => { throw err })
  }, [tickets, ticketUsers])

  useEffect(() => {
    if (!ticketHashes) return
    const paymentIds = ticketHashes.map(h => ({ id: h.ticketId, paymentId: h.paymentId }))
    Promise.all(paymentIds.map(async p => ({
      id: p.id,
      data: p.paymentId ? await getPaymentByIdAsync(p.paymentId) : null
    })))
      .then(fetchedPayments => setPayments(fetchedPayments.reduce((p, c) => ({ ...p, [c.id]: c.data }), {})))
      .catch(err => { throw err })
  }, [ticketHashes])

  return (
    <DefaultLayout title={store?.name ?? 'チケットストア情報'} requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/stores">チケットストア一覧</Link></li>
        <li>{store?._organization.name ?? <BlinkField />}</li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdStore />}
        title={store?.name}
        isLoading={!store} />

      <FormSection>
        <FormItem>
          <FormButton onClick={() => storeId && handleRefresh(storeId)} disabled={!storeId}>
            <IconLabel icon={<MdRefresh />} label='最新の情報に更新' />
          </FormButton>
        </FormItem>
      </FormSection>

      <FormSection>
        <FormItem $inlined>
          <LinkButton to={`/stores/${storeId}/create-tickets`}>
            <IconLabel icon={<MdAddCircleOutline />} label='チケット手動発券' />
          </LinkButton>
          <LinkButton to={`/stores/${storeId}/view-meta`}>
            <IconLabel icon={<MdDataset />} label='メタ情報参照' />
          </LinkButton>
          <AnchorButton href={`${envHelper.userAppURL}/stores/${storeId}`} target="_blank">
            <IconLabel icon={<MdOpenInNew />} label='申し込みページを開く' />
          </AnchorButton>
        </FormItem>
      </FormSection>

      <table>
        <thead>
          <tr>
            <th></th>
            <th>#</th>
            <th>申込</th>
            <th>決済</th>
            <th>割当</th>
            <th>使用</th>
            <th>種別</th>
            <th>購入者</th>
            <th>使用者</th>
            <th>ID</th>
            <th>更新</th>
          </tr>
        </thead>
        <tbody>
          {!tickets && (
            <tr>
              <td colSpan={10}>読込中です…</td>
            </tr>
          )}
          {tickets?.sort((a, b) => (b.createdAt?.getTime() ?? 9) - (a.createdAt?.getTime() ?? 0))
            .map((ticket, index) => (
              <tr key={ticket.id}>
                <td><FormCheck name={`select-${ticket.id}`} /></td>
                <td>{index + 1}</td>
                <td><ApplicationStatusLabel status={ticketMetas?.[ticket.id].applicationStatus} /></td>
                <td>{payments ? payments[ticket.id] !== null ? <PaymentStatusLabel status={payments[ticket.id]?.status} /> : '不要' : <BlinkField />}</td>
                <td>
                  {ticket.hashId
                    ? <TicketAssignStatusLabel usableUserId={ticketUsers?.[ticket.hashId].usableUserId} />
                    : <BlinkField />}
                </td>
                <td><TicketUsedStatusLabel used={ticketUsedStatuses?.[ticket.id].used} /></td>
                <td><TicketTypeLabel store={store} typeId={ticket.typeId} /></td>
                <td>{userDataSet?.[ticket.userId].name}</td>
                <td>
                  {ticket.hashId && ticketUsers && userDataSet
                    ? userDataSet[ticketUsers[ticket.hashId].userId].name
                    : <BlinkField />}
                </td>
                <td><Link to={`/tickets/${ticket.hashId}`}>{ticket.hashId ?? '---'}</Link></td>
                <td>{formatByDate(ticket.createdAt)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </DefaultLayout>
  )
}

export default StoreViewPage
