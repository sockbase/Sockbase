import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MdStore } from 'react-icons/md'
import {
  type SockbaseTicketDocument,
  type SockbaseStoreDocument,
  type SockbaseStoreType,
  type SockbaseAccount,
  type SockbaseTicketUsedStatus,
  type SockbaseTicketMeta
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
import TicketUsedStatusLabel from '../../../components/Parts/StatusLabel/TicketUsedStatusLabel'
import ApplicationStatusLabel from '../../../components/Parts/StatusLabel/ApplicationStatusLabel'
import FormSection from '../../../components/Form/FormSection'
import FormItem from '../../../components/Form/FormItem'
import FormSelect from '../../../components/Form/Select'

const StoreDetail: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>()

  const { formatByDate } = useDayjs()
  const {
    getStoreByIdAsync,
    getTicketsByStoreIdAsync,
    getTicketUsedStatusByIdAsync,
    getTicketMetaByIdAsync
  } = useStore()
  const { getUserDataByUserIdAndStoreIdOptionalAsync } = useUserData()

  const [store, setStore] = useState<SockbaseStoreDocument>()
  const [tickets, setTickets] = useState<SockbaseTicketDocument[]>()
  const [userDatas, setUserDatas] = useState<Record<string, SockbaseAccount | null>>()
  const [usedStatuses, setUsedStatuses] = useState<Record<string, SockbaseTicketUsedStatus>>()
  const [ticketMetas, setTicketMetas] = useState<Record<string, SockbaseTicketMeta>>()

  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState(-1)

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!storeId) return

      getStoreByIdAsync(storeId)
        .then(fetchedStore => setStore(fetchedStore))
        .catch(err => { throw err })

      getTicketsByStoreIdAsync(storeId)
        .then(fetchedTickets => setTickets(fetchedTickets))
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
        userIds.map(async (userId) => ({ id: userId, data: await getUserDataByUserIdAndStoreIdOptionalAsync(userId, storeId) }))
      )
        .then(fetchedUsers => mapObjectUsers(fetchedUsers))
        .catch(err => { throw err })

      Promise.all(
        ticketIds.map(async (ticketId) => ({ id: ticketId, data: await getTicketUsedStatusByIdAsync(ticketId) }))
      )
        .then(fetchedUsedStatuses => mapObjectTicketUsedStatuses(fetchedUsedStatuses))
        .catch(err => { throw err })

      Promise.all(
        ticketIds.map(async (ticketId) => ({ id: ticketId, data: await getTicketMetaByIdAsync(ticketId) }))
      )
        .then(fetchedTicketMetas => mapObjectTicketMetas(fetchedTicketMetas))
        .catch(err => { throw err })

      const mapObjectUsers = (users: Array<{ id: string, data: SockbaseAccount | null }>): void => {
        const objectMappedUsers = users
          .reduce<Record<string, SockbaseAccount | null>>((p, c) => ({ ...p, [c.id]: c.data }), {})
        setUserDatas(objectMappedUsers)
      }

      const mapObjectTicketUsedStatuses = (usedStatuses: Array<{ id: string, data: SockbaseTicketUsedStatus }>): void => {
        const objectMappedUsedStatuses = usedStatuses
          .reduce<Record<string, SockbaseTicketUsedStatus>>((p, c) => ({ ...p, [c.id]: c.data }), {})
        setUsedStatuses(objectMappedUsedStatuses)
      }

      const mapObjectTicketMetas = (ticketMetas: Array<{ id: string, data: SockbaseTicketMeta }>): void => {
        const objectMappedTicketMetas = ticketMetas
          .reduce<Record<string, SockbaseTicketMeta>>((p, c) => ({ ...p, [c.id]: c.data }), {})
        setTicketMetas(objectMappedTicketMetas)
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

  const usedTicketCount = useMemo(() => {
    if (!usedStatuses) return 0
    return Object.values(usedStatuses)
      .filter(s => s.used)
      .length
  }, [usedStatuses])

  const totalTicketCount = useMemo(() => {
    if (!tickets || !ticketMetas) return 0
    return tickets
      .filter(t => t.id && ticketMetas[t.id].applicationStatus !== 1)
      .length
  }, [tickets, ticketMetas])

  const filteredTickets = useMemo(() => {
    if (!tickets) return null
    return tickets
      .filter(t => !selectedType || t.typeId === selectedType)
      .filter(t => selectedStatus === -1 || t.id && ticketMetas?.[t.id].applicationStatus === selectedStatus)
  }, [tickets, ticketMetas, selectedType, selectedStatus])

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

      <FormSection>
        <FormItem>
          <FormSelect
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}>
            <option value="">種別を選択してください</option>
            {store?.types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </FormSelect>
        </FormItem>
        <FormItem>
          <FormSelect
            value={selectedStatus}
            onChange={e => setSelectedStatus(Number(e.target.value))}>
            <option value="-1">申し込みステータスを選択してください</option>
            <option value="2">申し込み確定</option>
            <option value="1">キャンセル</option>
            <option value="0">仮申し込み</option>
          </FormSelect>
        </FormItem>
      </FormSection>

      <p>
        {tickets
          && filteredTickets
          && tickets.length > filteredTickets.length
          && <>検索条件に一致するチケット: {filteredTickets.length} 枚<br /></>}
        使用されたチケット: {usedTicketCount} / {totalTicketCount} 枚 ({Math.round(usedTicketCount / totalTicketCount * 100)}%)
      </p>

      {(!store || !filteredTickets) && <Loading text="チケットストア情報" />}

      {store && tickets
        && <table>
          <thead>
            <tr>
              <th>#</th>
              <th>使用状態</th>
              <th>申し込み状態</th>
              <th>種別</th>
              <th>購入者</th>
              <th>チケットID</th>
              <th>更新日</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets && filteredTickets.length !== 0
              ? filteredTickets
                .sort((a, b) => (b.updatedAt?.getTime() ?? b.createdAt?.getTime() ?? 9) - (a.updatedAt?.getTime() ?? a.createdAt?.getTime() ?? 0))
                .map((t, i) => <tr key={t.id}>
                  <td>{filteredTickets.length - i}</td>
                  <td>{(t?.id && <TicketUsedStatusLabel status={usedStatuses?.[t.id].used} />) ?? <BlinkField />}</td>
                  <td>{t?.id && <ApplicationStatusLabel status={ticketMetas?.[t.id].applicationStatus} />}</td>
                  <td><Link to={`/dashboard/tickets/${t.hashId}`}>{getType(t.typeId)?.name}</Link></td>
                  <td>
                    {userDatas
                      ? userDatas?.[t.userId]?.name || '-'
                      : <BlinkField />}
                  </td>
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
