import { useCallback, useEffect, useState } from 'react'
import {
  MdAddCircleOutline,
  MdDataset,
  MdOpenInNew,
  MdStore
} from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import AnchorButton from '../../components/Parts/AnchorButton'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import LinkButton from '../../components/Parts/LinkButton'
import PageTitle from '../../components/Parts/PageTitle'
import ApplicationStatusLabel from '../../components/StatusLabel/ApplicationStatusLabel'
import TicketAssignStatusLabel from '../../components/StatusLabel/TicketAssignStatusLabel'
import TicketTypeLabel from '../../components/StatusLabel/TicketTypeLabel'
import TicketUsedStatusLabel from '../../components/StatusLabel/TicketUsedStatusLabel'
import envHelper from '../../helpers/envHelper'
import useDayjs from '../../hooks/useDayjs'
import useStore from '../../hooks/useStore'
import useUserData from '../../hooks/useUserData'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseAccount, SockbaseStoreDocument, SockbaseTicketDocument, SockbaseTicketMeta, SockbaseTicketUsedStatus, SockbaseTicketUser } from 'sockbase'

const StoreViewPage: React.FC = () => {
  const { storeId } = useParams()

  const { formatByDate } = useDayjs()
  const {
    getStoreByIdAsync,
    getTicketsByStoreIdAsync,
    getTicketMetaByIdAsync,
    getTicketUserByHashIdAsync,
    getTicketUsedStatusByIdAsync
  } = useStore()
  const { getUserDataByUserIdAndStoreIdAsync } = useUserData()

  const [store, setStore] = useState<SockbaseStoreDocument>()
  const [tickets, setTickets] = useState<SockbaseTicketDocument[]>()
  const [ticketMetas, setTicketMetas] = useState<Record<string, SockbaseTicketMeta>>()
  const [ticketUsers, setTicketUsers] = useState<Record<string, SockbaseTicketUser>>()
  const [ticketUsedStatuses, setTicketUsedStatuses] = useState<Record<string, SockbaseTicketUsedStatus>>()
  const [userDataSet, setUserDataSet] = useState<Record<string, SockbaseAccount>>()

  useEffect(() => {
    if (!storeId) return

    getStoreByIdAsync(storeId)
      .then(setStore)
      .catch(err => { throw err })
    getTicketsByStoreIdAsync(storeId)
      .then(setTickets)
      .catch(err => { throw err })
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

  return (
    <DefaultLayout title={store?.name ?? 'チケットストア情報'} requireSystemRole={2}>
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
        <FormItem $inlined>
          <LinkButton to="/">
            <IconLabel icon={<MdAddCircleOutline />} label='チケット手動発券' />
          </LinkButton>
          <LinkButton to="/">
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
            <th>#</th>
            <th>申込</th>
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
              <td colSpan={9}>読込中です…</td>
            </tr>
          )}
          {tickets?.sort((a, b) => (b.createdAt?.getTime() ?? 9) - (a.createdAt?.getTime() ?? 0))
            .map((ticket, index) => (
              <tr key={ticket.id}>
                <td>{index + 1}</td>
                <td><ApplicationStatusLabel status={ticketMetas?.[ticket.id].applicationStatus} /></td>
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
