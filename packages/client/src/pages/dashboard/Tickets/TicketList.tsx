import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MdWallet } from 'react-icons/md'
import {
  type SockbaseTicketMeta,
  type SockbaseStoreDocument,
  type SockbaseTicketDocument
} from 'sockbase'
import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import PageTitle from '../../../components/Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import useStore from '../../../hooks/useStore'
import useDayjs from '../../../hooks/useDayjs'
import Loading from '../../../components/Parts/Loading'
import sockbaseShared from 'shared'

const TicketList: React.FC = () => {
  const { getMyTicketsAsync, getStoreByIdAsync, getTicketMetaByIdAsync } = useStore()
  const { formatByDate } = useDayjs()

  const [tickets, setTickets] = useState<SockbaseTicketDocument[]>()
  const [ticketMetas, setTicketMetas] = useState<Array<SockbaseTicketMeta & { ticketId: string }>>()
  const [stores, setStores] = useState<SockbaseStoreDocument[]>()

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      const fetchedTickets = await getMyTicketsAsync()
      if (!fetchedTickets) return

      const ticketIdsSet = fetchedTickets
        .reduce((p, c) => {
          if (!c.id) return p
          return p.add(c.id)
        }, new Set<string>())
      const ticketIds = [...ticketIdsSet]

      const storeIdsSet = fetchedTickets
        .reduce((p, c) => p.add(c.storeId), new Set<string>())
      const storeIds = [...storeIdsSet]

      const fetchedTicketMetas = await Promise.all(
        ticketIds.map(async i => ({ ticketId: i, ...(await getTicketMetaByIdAsync(i)) }))
      )
      const fetchedStores = await Promise.all(
        storeIds.map(async i => await getStoreByIdAsync(i))
      )

      setTickets(fetchedTickets)
      setTicketMetas(fetchedTicketMetas)
      setStores(fetchedStores)
    }

    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [getMyTicketsAsync])

  const getStoreName = (storeId: string): string => {
    if (!stores) return ''
    const store = stores
      .filter(s => s.id === storeId)[0]
    return store.storeName
  }

  const getTypeName = (storeId: string, typeId: string): string => {
    if (!stores) return ''
    const store = stores
      .filter(s => s.id === storeId)[0]
    const type = store.types
      .filter(t => t.id === typeId)[0]
    return type.name
  }

  const getTicketApplicationStatus = (ticketId: string): string => {
    if (!ticketMetas) return ''
    const ticketMeta = ticketMetas.filter(t => t.ticketId === ticketId)[0]

    return sockbaseShared.constants.application.statusText[ticketMeta.applicationStatus]
  }

  return (
    <DashboardLayout title="購入済みチケット一覧">
      <Breadcrumbs>
        <li><Link to="/dashboard/">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle title="購入済みチケット一覧" icon={<MdWallet />} description="あなたが購入したチケットを表示中" />

      {tickets && ticketMetas
        ? <table>
          <thead>
            <tr>
              <th>チケットストア</th>
              <th>参加種別</th>
              <th>申し込み状況</th>
              <th>購入日時</th>
            </tr>
          </thead>
          <tbody>
            {tickets
              .sort((a, b) => (b.createdAt?.getTime() ?? 9) - (a.createdAt?.getTime() ?? 0))
              .map(t => <tr key={t.id}>
                <th><Link to={`/dashboard/tickets/${t.hashId}`}>{getStoreName(t.storeId)}</Link></th>
                <td>{getTypeName(t.storeId, t.typeId)}</td>
                <td>{t.id && getTicketApplicationStatus(t.id)}</td>
                <td>{t.createdAt && formatByDate(t.createdAt, 'YYYY年M月D日 H時mm分')}</td>
              </tr>)}
            {tickets?.length === 0 && <tr>
              <td colSpan={3}>
                購入したチケットはありません。<br />
                他のユーザーから譲り受けたチケットは <Link to="/dashboard/mytickets">マイチケット</Link> からご確認ください。
              </td>
            </tr>}
          </tbody>
        </table>
        : <Loading text="チケット一覧" />}
    </DashboardLayout>
  )
}

export default TicketList