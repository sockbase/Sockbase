import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MdLocalActivity } from 'react-icons/md'
import {
  type SockbaseStoreDocument,
  type SockbaseTicketUserDocument
} from 'sockbase'
import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import PageTitle from '../../../components/Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import useStore from '../../../hooks/useStore'
import Loading from '../../../components/Parts/Loading'

const MyTickets: React.FC = () => {
  const { getUsableTicketsAsync, getStoreByIdAsync } = useStore()

  const [ticketUsers, setTicketUsers] = useState<SockbaseTicketUserDocument[]>()
  const [stores, setStores] = useState<SockbaseStoreDocument[]>()

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      const fetchedTicketUsers = await getUsableTicketsAsync()
      if (!fetchedTicketUsers) return

      const storeIdsSet = fetchedTicketUsers
        .reduce((p, c) => p.add(c.storeId), new Set<string>())
      const storeIds = [...storeIdsSet]

      const fetchedStores = await Promise.all(
        storeIds.map(async i => await getStoreByIdAsync(i))
      )

      setTicketUsers(fetchedTicketUsers)
      setStores(fetchedStores)
    }

    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [getUsableTicketsAsync])

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

  return (
    <DashboardLayout title="マイチケット">
      <Breadcrumbs>
        <li><Link to="/dashboard/">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle title="マイチケット" icon={<MdLocalActivity />} description="あなたに割り当てられているチケットを表示中" />

      {ticketUsers
        ? <table>
          <thead>
            <tr>
              <th>#</th>
              <th>チケットストア</th>
              <th>参加種別</th>
              <th>状態</th>
              <th>チケットID</th>
            </tr>
          </thead>
          <tbody>
            {ticketUsers
              .map((t, i) => <tr key={t.hashId}>
                <td>{i + 1}</td>
                <th><Link to={`/dashboard/mytickets/${t.hashId}`}>{getStoreName(t.storeId)}</Link></th>
                <td>{getTypeName(t.storeId, t.typeId)}</td>
                <td>{t.used ? '使用済み' : '未使用'}</td>
                <td>{t.hashId}</td>
              </tr>)}
            {ticketUsers?.length === 0 && <tr>
              <td colSpan={4}>
                割り当てられているチケットはありません。<br />
                ご自身で購入したチケットは <Link to="/dashboard/tickets">購入済みチケット一覧</Link> からご確認ください。
              </td>
            </tr>}
          </tbody>
        </table>
        : <Loading text="チケット一覧" />}
    </DashboardLayout>
  )
}

export default MyTickets
