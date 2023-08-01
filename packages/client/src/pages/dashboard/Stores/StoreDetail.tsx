import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MdStore } from 'react-icons/md'
import {
  type SockbaseTicketDocument,
  type SockbaseStoreDocument,
  type SockbaseStoreType,
  type SockbaseAccount,
  type SockbaseTicketUsedStatus
} from 'sockbase'
import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import PageTitle from '../../../components/Layout/Dashboard/PageTitle'
import Loading from '../../../components/Parts/Loading'
import useStore from '../../../hooks/useStore'
import useDayjs from '../../../hooks/useDayjs'
import useUserData from '../../../hooks/useUserData'
import BlinkField from '../../../components/Parts/BlinkField'
import LinkButton from '../../../components/Parts/LinkButton'

const StoreDetail: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>()

  const { formatByDate } = useDayjs()
  const { getStoreByIdAsync, getTicketsByStoreIdAsync, getTicketUsedStatusByIdAsync } = useStore()
  const { getUserDataByUserIdAndStoreIdAsync } = useUserData()

  const [store, setStore] = useState<SockbaseStoreDocument>()
  const [tickets, setTickets] = useState<SockbaseTicketDocument[]>()
  const [userDatas, setUserDatas] = useState<Record<string, SockbaseAccount>>()
  const [usedStatuses, setUsedStatuses] = useState<Record<string, SockbaseTicketUsedStatus>>()

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!storeId) return

      getStoreByIdAsync(storeId)
        .then(fetchedStore => setStore(fetchedStore))
        .catch(err => { throw err })

      getTicketsByStoreIdAsync(storeId)
        .then(fetchedTickets => {
          console.log(fetchedTickets)
          setTickets(fetchedTickets)
        })
        .catch(err => { throw err })
    }
    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [storeId])

  const onFetchedTickets = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!tickets || !storeId) return

      const userIdsSet = tickets
        .reduce((p, c) => p.add(c.userId), new Set<string>())
      const userIds = [...userIdsSet]

      const ticketIds = tickets
        .filter(t => t.id)
        .map(t => t?.id ?? '')

      Promise.all(
        userIds.map(async (userId) => ({ id: userId, data: await getUserDataByUserIdAndStoreIdAsync(userId, storeId) }))
      )
        .then(fetchedUsers => mapObjectUsers(fetchedUsers))
        .catch(err => { throw err })

      Promise.all(
        ticketIds.map(async (ticketId) => ({ id: ticketId, data: await getTicketUsedStatusByIdAsync(ticketId) }))
      )
        .then(fetchedUsedStatuses => mapObjectTicketUsedStatuses(fetchedUsedStatuses))
        .catch(err => { throw err })

      const mapObjectUsers = (users: Array<{ id: string, data: SockbaseAccount }>): void => {
        const objectMappedUsers = users
          .reduce<Record<string, SockbaseAccount>>((p, c) => ({ ...p, [c.id]: c.data }), {})
        setUserDatas(objectMappedUsers)
      }

      const mapObjectTicketUsedStatuses = (usedStatuses: Array<{ id: string, data: SockbaseTicketUsedStatus }>): void => {
        const objectMappedUsedStatuses = usedStatuses
          .reduce<Record<string, SockbaseTicketUsedStatus>>((p, c) => ({ ...p, [c.id]: c.data }), {})
        setUsedStatuses(objectMappedUsedStatuses)
      }

    }
    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onFetchedTickets, [tickets, storeId])

  const pageTitle = useMemo(() => {
    if (!store) return '読み込み中'
    return `${store.storeName} チケット一覧`
  }, [store])

  const getType = (typeId: string): SockbaseStoreType | undefined => {
    if (!store) return
    const type = store.types
      .filter(t => t.id === typeId)[0]
    return type
  }

  return (
    <DashboardLayout title={pageTitle}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/stores">管理チケットストア</Link></li>
      </Breadcrumbs>
      <PageTitle title={store?.storeName} icon={<MdStore />} description="発券済みチケットの一覧" isLoading={!store} />

      <p>
        <LinkButton to={`/dashboard/stores/${storeId}/create`} inlined>チケット作成</LinkButton>
      </p>

      {(!store || !tickets) && <Loading text="チケットストア情報" />}

      {store && tickets
        && <table>
          <thead>
            <tr>
              <th>#</th>
              <th>種別</th>
              <th>使用状態</th>
              <th>購入者</th>
              <th>チケットID</th>
              <th>更新日</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length !== 0
              ? tickets
                .sort((a, b) => (b.updatedAt?.getTime() ?? b.createdAt?.getTime() ?? 9) - (a.updatedAt?.getTime() ?? a.createdAt?.getTime() ?? 0))
                .map((t, i) => <tr key={t.id}>
                  <td>{i + 1}</td>
                  <td><Link to={`/dashboard/tickets/${t.hashId}`}>{getType(t.typeId)?.name}</Link></td>
                  <td>{(t?.id && usedStatuses?.[t.id].used ? '済' : '未') ?? <BlinkField />}</td>
                  <td>{userDatas?.[t.userId].name ?? <BlinkField />}</td>
                  <td>{t.hashId}</td>
                  <td>{formatByDate(t.updatedAt ?? t.createdAt, 'YYYY/MM/DD H:mm:ss')}</td>
                </tr>)
              : <tr>
                <td colSpan={6}>申し込まれているチケットがありません</td>
              </tr>}
          </tbody>
        </table>}

    </DashboardLayout>
  )
}

export default StoreDetail
