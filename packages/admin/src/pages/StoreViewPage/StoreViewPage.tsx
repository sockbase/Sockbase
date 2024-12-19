import { useCallback, useEffect, useMemo, useState } from 'react'
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
import FormLabel from '../../components/Form/FormLabel'
import FormSection from '../../components/Form/FormSection'
import FormSelect from '../../components/Form/FormSelect'
import ActiveTR from '../../components/Parts/ActiveTR'
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
    getTicketIdByHashIdAsync,
    setTicketApplicationStatusAsync
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

  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const [selectedTypeId, setSelectedTypeId] = useState('')
  const [selectedApplicationStatus, setSelectedApplicationStatus] = useState('')
  const [selectedAssignStatus, setSelectedAssignStatus] = useState('')

  const filteredTickets = useMemo(() => {
    if (!tickets || !ticketUsers || !ticketMetas) return undefined
    return tickets.filter(ticket => {
      if (selectedTypeId && ticket.typeId !== selectedTypeId) return false
      if (selectedApplicationStatus && ticketMetas[ticket.id].applicationStatus !== parseInt(selectedApplicationStatus)) return false
      if (selectedAssignStatus) {
        if (selectedAssignStatus === '0' && ticket.hashId && ticketUsers[ticket.hashId].usableUserId) return false
        if (selectedAssignStatus === '1' && ticket.hashId && !ticketUsers[ticket.hashId].usableUserId) return false
      }
      return true
    })
  }, [tickets, selectedTypeId, selectedApplicationStatus, selectedAssignStatus, ticketMetas, ticketUsers])

  const handleSelectTicket = useCallback((ticketId: string, isAdd: boolean) => {
    if (isAdd) {
      setSelectedTicketIds(s => ([...s, ticketId]))
    }
    else {
      setSelectedTicketIds(s => s.filter(id => id !== ticketId))
    }
  }, [])

  const handleSelectAllTicket = useCallback((isAdd: boolean) => {
    if (isAdd) {
      setSelectedTicketIds(tickets?.map(t => t.id) ?? [])
    }
    else {
      setSelectedTicketIds([])
    }
  }, [tickets])

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

  const handleBulkChangeStatus = useCallback((statusText: string) => {
    if (!selectedTicketIds.length) return
    if (!confirm('選択したチケットの申し込みステータスを変更します。\nよろしいですか？')) return

    const sanitizedStatus = parseInt(statusText)
    switch (sanitizedStatus) {
      case 0:
      case 1:
      case 2:
        break
      default:
        return
    }

    setIsProcessing(true)
    Promise.all(selectedTicketIds.map(async id => await setTicketApplicationStatusAsync(id, sanitizedStatus)))
      .then(() => {
        setTicketMetas(s => {
          if (!s) return
          return selectedTicketIds.reduce((acc, id) => {
            acc[id] = { ...s[id], applicationStatus: sanitizedStatus }
            return acc
          }, { ...s })
        })
        alert('変更しました')
      })
      .catch(err => { throw err })
      .finally(() => setIsProcessing(false))
  }, [selectedTicketIds])

  return (
    <DefaultLayout
      requireCommonRole={2}
      title={store?.name ?? 'チケットストア情報'}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/stores">チケットストア一覧</Link></li>
        <li>{store?._organization.name ?? <BlinkField />}</li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdStore />}
        isLoading={!store}
        title={store?.name} />

      <FormSection>
        <FormItem>
          <FormButton
            disabled={!storeId}
            onClick={() => storeId && handleRefresh(storeId)}>
            <IconLabel
              icon={<MdRefresh />}
              label="最新の情報に更新" />
          </FormButton>
        </FormItem>
      </FormSection>

      <FormSection>
        <FormItem $inlined>
          <LinkButton to={`/stores/${storeId}/create-tickets`}>
            <IconLabel
              icon={<MdAddCircleOutline />}
              label="チケット手動発券" />
          </LinkButton>
          <LinkButton to={`/stores/${storeId}/view-meta`}>
            <IconLabel
              icon={<MdDataset />}
              label="メタ情報参照" />
          </LinkButton>
          <AnchorButton
            href={`${envHelper.userAppURL}/stores/${storeId}`}
            target="_blank">
            <IconLabel
              icon={<MdOpenInNew />}
              label="申し込みページを開く" />
          </AnchorButton>
        </FormItem>
      </FormSection>

      <FormSection>
        <FormItem>
          <FormLabel>フィルター</FormLabel>
        </FormItem>
        <FormItem>
          <FormSelect
            onChange={e => setSelectedTypeId(e.target.value)}
            value={selectedTypeId}>
            <option value="">種別を選択</option>
            {store?.types.map(type => (
              <option
                key={type.id}
                value={type.id}>{type.name}
              </option>
            ))}
          </FormSelect>
        </FormItem>
        <FormItem>
          <FormSelect
            onChange={e => setSelectedApplicationStatus(e.target.value)}
            value={selectedApplicationStatus}>
            <option value="">ステータスを選択</option>
            <option value="0">確認待ち</option>
            <option value="1">キャンセル</option>
            <option value="2">確定</option>
          </FormSelect>
        </FormItem>
        <FormItem>
          <FormSelect
            onChange={e => setSelectedAssignStatus(e.target.value)}
            value={selectedAssignStatus}>
            <option value="">割当状況を選択</option>
            <option value="0">未割当</option>
            <option value="1">割当済</option>
          </FormSelect>
        </FormItem>
      </FormSection>

      <FormSection>
        <FormItem>
          <FormLabel>申し込みステータスを変更</FormLabel>
          <FormSelect
            disabled={!selectedTicketIds.length || isProcessing}
            onChange={e => handleBulkChangeStatus(e.target.value)}
            value="">
            <option value="">操作を選択</option>
            <option value="0">確認待ちに変更</option>
            <option value="1">キャンセルに変更</option>
            <option value="2">確定に変更</option>
          </FormSelect>
        </FormItem>
      </FormSection>

      <table>
        <thead>
          <tr>
            <th>
              <FormCheck
                checked={selectedTicketIds.length === tickets?.length}
                name="select-all"
                onChange={handleSelectAllTicket} />
            </th>
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
          {!filteredTickets && (
            <tr>
              <td colSpan={10}>読み込み中…</td>
            </tr>
          )}
          {filteredTickets && filteredTickets.length === 0 && (
            <tr>
              <td colSpan={10}>該当するチケットがありません</td>
            </tr>
          )}
          {filteredTickets?.sort((a, b) => (b.createdAt?.getTime() ?? 9) - (a.createdAt?.getTime() ?? 0))
            .map((ticket, index) => (
              <ActiveTR
                active={selectedTicketIds.includes(ticket.id)}
                key={ticket.id}>
                <td>
                  <FormCheck
                    checked={selectedTicketIds.includes(ticket.id)}
                    name={`select-${ticket.id}`}
                    onChange={c => handleSelectTicket(ticket.id, c)} />
                </td>
                <td>{index + 1}</td>
                <td>
                  <ApplicationStatusLabel
                    isOnlyIcon
                    status={ticketMetas?.[ticket.id].applicationStatus} />
                </td>
                <td>
                  {payments
                    ? payments[ticket.id] !== null
                      ? (
                        <PaymentStatusLabel
                          isOnlyIcon
                          isShowBrand
                          payment={payments[ticket.id] ?? undefined} />
                      )
                      : '不要'
                    : <BlinkField />}
                </td>
                <td>
                  {ticket.hashId
                    ? (
                      <TicketAssignStatusLabel
                        isOnlyIcon
                        usableUserId={ticketUsers?.[ticket.hashId].usableUserId} />
                    )
                    : <BlinkField />}
                </td>
                <td>
                  <TicketUsedStatusLabel
                    isOnlyIcon
                    used={ticketUsedStatuses?.[ticket.id].used} />
                </td>
                <td>
                  <TicketTypeLabel
                    store={store}
                    typeId={ticket.typeId} />
                </td>
                <td>{userDataSet?.[ticket.userId].name}</td>
                <td>
                  {ticket.hashId && ticketUsers && userDataSet
                    ? userDataSet[ticketUsers[ticket.hashId].userId].name
                    : <BlinkField />}
                </td>
                <td><Link to={`/tickets/${ticket.hashId}`}>{ticket.hashId ?? '---'}</Link></td>
                <td>{formatByDate(ticket.createdAt, 'M/D H:m')}</td>
              </ActiveTR>
            ))}
        </tbody>
      </table>
    </DefaultLayout>
  )
}

export default StoreViewPage
