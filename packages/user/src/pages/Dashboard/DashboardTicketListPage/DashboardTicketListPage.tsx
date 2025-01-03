import { useEffect, useState } from 'react'
import { MdWallet } from 'react-icons/md'
import { Link } from 'react-router-dom'
import {
  type SockbaseTicketMeta,
  type SockbaseStoreDocument,
  type SockbaseTicketDocument,
  type SockbaseStoreType,
  type SockbaseApplicationStatus,
  type SockbaseTicketUserDocument
} from 'sockbase'
import Alert from '../../../components/Parts/Alert'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import Loading from '../../../components/Parts/Loading'
import ApplicationStatusLabel from '../../../components/Parts/StatusLabel/ApplicationStatusLabel'
import StoreTypeLabel from '../../../components/Parts/StatusLabel/StoreTypeLabel'
import TicketAssignStatusLabel from '../../../components/Parts/StatusLabel/TicketAssignStatusLabel'
import useDayjs from '../../../hooks/useDayjs'
import useStore from '../../../hooks/useStore'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'

const DashboardTicketListPage: React.FC = () => {
  const {
    getMyTicketsAsync,
    getStoreByIdAsync,
    getTicketMetaByIdAsync,
    getTicketUserByHashIdAsync
  } = useStore()
  const { formatByDate } = useDayjs()

  const [tickets, setTickets] = useState<SockbaseTicketDocument[]>()
  const [ticketMetas, setTicketMetas] = useState<Array<SockbaseTicketMeta & { ticketId: string }>>()
  const [ticketUsers, setTicketUsers] = useState<SockbaseTicketUserDocument[]>()
  const [stores, setStores] = useState<SockbaseStoreDocument[]>()

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      const fetchedTickets = await getMyTicketsAsync()
      if (!fetchedTickets) return

      const ticketIds = fetchedTickets
        .map(t => t.id ?? '')
      const ticketHashIds = fetchedTickets
        .map(t => t.hashId ?? '')

      const storeIdsSet = fetchedTickets
        .reduce((p, c) => p.add(c.storeId), new Set<string>())
      const storeIds = [...storeIdsSet]

      const fetchedTicketMetas = await Promise.all(
        ticketIds.map(async i => ({ ticketId: i, ...(await getTicketMetaByIdAsync(i)) }))
      )
      const fetchedStores = await Promise.all(
        storeIds.map(async i => await getStoreByIdAsync(i))
      )

      const fetchedTicketUsers = await Promise.all(
        ticketHashIds.map(async i => await getTicketUserByHashIdAsync(i))
      )

      setTickets(fetchedTickets)
      setTicketMetas(fetchedTicketMetas)
      setStores(fetchedStores)
      setTicketUsers(fetchedTicketUsers)
    }

    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [getMyTicketsAsync])

  const getname = (storeId: string): string => {
    if (!stores) return ''
    const store = stores
      .filter(s => s.id === storeId)[0]
    return store.name
  }

  const getType = (storeId: string, typeId: string): SockbaseStoreType | undefined => {
    if (!stores) return
    const store = stores
      .filter(s => s.id === storeId)[0]
    return store.types
      .filter(t => t.id === typeId)[0]
  }

  const getTicketApplicationStatus = (ticketId: string): SockbaseApplicationStatus => {
    if (!ticketMetas) return 0
    const ticketMeta = ticketMetas.filter(t => t.ticketId === ticketId)[0]

    return ticketMeta.applicationStatus
  }

  const getTicketUser = (hashId: string): SockbaseTicketUserDocument | undefined => {
    if (!ticketUsers) return
    const ticketUser = ticketUsers.filter(t => t.hashId === hashId)[0]
    return ticketUser
  }

  return (
    <DashboardBaseLayout title="購入済みチケット">
      <Breadcrumbs>
        <li><Link to="/dashboard/">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle
        description="あなたが購入したチケットを表示中"
        icon={<MdWallet />}
        title="購入済みチケット" />

      <Alert
        title="受け取ったチケットが見つからない場合"
        type="info">
        受け取ったチケットは <Link to="/dashboard/mytickets">マイチケット</Link> で確認できます。
      </Alert>

      {tickets && ticketMetas && ticketUsers
        ? (
          <table>
            <thead>
              <tr>
                <th>チケットストア</th>
                <th>割り当て状態</th>
                <th>参加種別</th>
                <th>申し込み状態</th>
                <th>購入日時</th>
              </tr>
            </thead>
            <tbody>
              {tickets?.length > 0
                ? tickets
                  .sort((a, b) => (b.createdAt?.getTime() ?? 9) - (a.createdAt?.getTime() ?? 0))
                  .map(t => (
                    <tr key={t.id}>
                      <th><Link to={`/dashboard/tickets/${t.hashId}`}>{getname(t.storeId)}</Link></th>
                      <td>{t.hashId && <TicketAssignStatusLabel status={!!getTicketUser(t.hashId)?.usableUserId} />}</td>
                      <td><StoreTypeLabel type={getType(t.storeId, t.typeId)} /></td>
                      <td>{t.id && <ApplicationStatusLabel status={getTicketApplicationStatus(t.id)} />}</td>
                      <td>{t.createdAt && formatByDate(t.createdAt, 'YYYY年 M月 D日 H時mm分')}</td>
                    </tr>
                  ))
                : (
                  <tr>
                    <td colSpan={5}>
                  購入したチケットはありません。<br />
                  他のユーザーから譲り受けたチケットは <Link to="/dashboard/mytickets">マイチケット</Link> からご確認ください。
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        )
        : <Loading text="チケット一覧" />}
    </DashboardBaseLayout>
  )
}

export default DashboardTicketListPage
