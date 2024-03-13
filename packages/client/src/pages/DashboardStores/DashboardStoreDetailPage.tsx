import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdStore } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import {
  type SockbaseTicketDocument,
  type SockbaseStoreDocument,
  type SockbaseStoreType,
  type SockbaseAccount,
  type SockbaseTicketUsedStatus,
  type SockbaseTicketMeta,
  type SockbaseTicketUserDocument
} from 'sockbase'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import FormSelect from '../../components/Form/Select'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import AnchorButton from '../../components/Parts/AnchorButton'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import CopyToClipboard from '../../components/Parts/CopyToClipboard'
import LinkButton from '../../components/Parts/LinkButton'
import Loading from '../../components/Parts/Loading'
import ApplicationStatusLabel from '../../components/Parts/StatusLabel/ApplicationStatusLabel'
import StoreTypeLabel from '../../components/Parts/StatusLabel/StoreTypeLabel'
import TicketAssignStatusLabel from '../../components/Parts/StatusLabel/TicketAssignStatusLabel'
import TicketUsedStatusLabel from '../../components/Parts/StatusLabel/TicketUsedStatusLabel'
import useDayjs from '../../hooks/useDayjs'
import useStore from '../../hooks/useStore'
import useUserData from '../../hooks/useUserData'

const DashboardStoreDetailPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>()

  const { formatByDate } = useDayjs()
  const {
    getStoreByIdAsync,
    getTicketsByStoreIdAsync,
    getTicketUsedStatusByIdAsync,
    getTicketMetaByIdAsync,
    getTicketUserByHashIdAsync,
    exportCSV
  } = useStore()
  const { getUserDataByUserIdAndStoreIdOptionalAsync } = useUserData()

  const [store, setStore] = useState<SockbaseStoreDocument>()
  const [tickets, setTickets] = useState<SockbaseTicketDocument[]>()
  const [ticketUsers, setTicketUsers] = useState<Record<string, SockbaseTicketUserDocument>>()
  const [userDatas, setUserDatas] = useState<Record<string, SockbaseAccount | null>>()
  const [usedStatuses, setUsedStatuses] = useState<Record<string, SockbaseTicketUsedStatus>>()
  const [ticketMetas, setTicketMetas] = useState<Record<string, SockbaseTicketMeta>>()
  const [usableUsers, setUsableUsers] = useState<Record<string, SockbaseAccount | null>>()

  const [ticketCSV, setTicketCSV] = useState('')

  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState(-1)
  const [selectedAssign, setSelectedAssign] = useState('')

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

      const ticketHashIds = tickets
        .filter(t => t.hashId)
        .map(t => t.hashId ?? '')

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

      Promise.all(
        ticketHashIds.map(async (hashId) => ({ id: hashId, data: await getTicketUserByHashIdAsync(hashId) }))
      )
        .then(fetchedTicketUsers => mapObjectTicketUsers(fetchedTicketUsers))
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

      const mapObjectTicketUsers = (ticketUsers: Array<{ id: string, data: SockbaseTicketUserDocument }>): void => {
        const objectMappedTicketUsers = ticketUsers
          .reduce<Record<string, SockbaseTicketUserDocument>>((p, c) => ({ ...p, [c.id]: c.data }), {})
        setTicketUsers(objectMappedTicketUsers)
      }
    }
    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onFetchedTickets, [tickets, storeId])

  const onFetchedTicketUsers = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!storeId || !ticketUsers) return

      const ticketUsableUserIdsSet = Object.values(ticketUsers)
        .filter(u => u.usableUserId)
        .map(u => u?.usableUserId ?? '')
        .reduce((p, id) => p.add(id), new Set<string>())
      const ticketUsableUserIds = [...ticketUsableUserIdsSet]

      Promise.all(
        ticketUsableUserIds
          .map(async id => ({ id, data: await getUserDataByUserIdAndStoreIdOptionalAsync(id, storeId) }))
      )
        .then((fetchedUsableUsers) => mapObjectTicketUsableUsers(fetchedUsableUsers))
        .catch(err => { throw err })

      const mapObjectTicketUsableUsers = (usableUsers: Array<{ id: string, data: SockbaseAccount | null }>): void => {
        const objectMappedUsableUsers = usableUsers
          .reduce<Record<string, SockbaseAccount | null>>((p, c) => ({ ...p, [c.id]: c.data }), {})
        setUsableUsers(objectMappedUsableUsers)
      }
    }
    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onFetchedTicketUsers, [storeId, ticketUsers])

  const pageTitle = useMemo(() => {
    if (!store) return '読み込み中'
    return `${store.storeName} チケット一覧`
  }, [store])

  const getType = useCallback((typeId: string): SockbaseStoreType | undefined => {
    if (!store) return
    const type = store.types
      .filter(t => t.id === typeId)[0]
    return type
  }, [store])

  const getUsableUser = useCallback((ticketId: string): SockbaseAccount | null | undefined => {
    if (!tickets || !ticketUsers || !usableUsers) return

    const ticket = tickets.filter(t => t.id === ticketId)[0]
    if (!ticket.hashId) return

    const ticketUser = ticketUsers[ticket.hashId]
    if (!ticketUser?.usableUserId) return

    const usableUser = usableUsers[ticketUser.usableUserId]
    return usableUser
  }, [ticketUsers, usableUsers])

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
      .filter(t => selectedStatus === -1 || (t.id && ticketMetas?.[t.id].applicationStatus === selectedStatus))
      .filter(t => !selectedAssign ||
        (selectedAssign === 'yes' && t.hashId && ticketUsers?.[t.hashId].usableUserId) ||
        (selectedAssign === 'no' && t.hashId && !ticketUsers?.[t.hashId].usableUserId))
  }, [tickets, ticketMetas, ticketUsers, selectedType, selectedStatus, selectedAssign])

  const onFetchedAllData = (): void => {
    if (!filteredTickets || !ticketUsers || !usableUsers) return

    const csv = exportCSV(filteredTickets, ticketUsers, usableUsers)
    setTicketCSV(csv)
  }
  useEffect(onFetchedAllData, [filteredTickets, ticketUsers, usableUsers])

  return (
    <DashboardBaseLayout title={pageTitle} requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/stores">管理チケットストア</Link></li>
        <li>{store?._organization.name ?? <BlinkField />}</li>
      </Breadcrumbs>
      <PageTitle title={store?.storeName} icon={<MdStore />} description="発券済みチケットの一覧" isLoading={!store} />

      <FormSection>
        <FormItem inlined>
          <LinkButton to={`/dashboard/stores/${storeId}/create`} inlined>チケット作成</LinkButton>
          <LinkButton to={`/dashboard/stores/${storeId}/info`} color="default" inlined>メタ情報参照</LinkButton>
          <AnchorButton href={`/stores/${storeId}`} color="default" inlined target="_blank">申し込みページを開く</AnchorButton>
        </FormItem>
      </FormSection>

      <p>
        参加者リストCSVコピー <CopyToClipboard content={ticketCSV} />
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
        <FormItem>
          <FormSelect
            value={selectedAssign}
            onChange={e => setSelectedAssign(e.target.value)}>
            <option value="">割当状況を選択してください</option>
            <option value="yes">割当済み</option>
            <option value="no">未割当</option>
          </FormSelect>
        </FormItem>
      </FormSection>

      <p>
        {tickets &&
          filteredTickets &&
          tickets.length > filteredTickets.length &&
          <>検索条件に一致するチケット: {filteredTickets.length} 枚<br /></>}
        使用されたチケット: {usedTicketCount} / {totalTicketCount} 枚 ({Math.round(usedTicketCount / totalTicketCount * 100)}%)
      </p>

      {(!store || !filteredTickets) && <Loading text="チケットストア情報" />}

      {store && tickets &&
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
                  <td>{t?.id && <ApplicationStatusLabel status={ticketMetas?.[t.id].applicationStatus} />}</td>
                  <td>{(t?.hashId && <TicketAssignStatusLabel status={!!ticketUsers?.[t.hashId]?.usableUserId}/>) ?? <BlinkField />}</td>
                  <td>{(t?.id && <TicketUsedStatusLabel status={usedStatuses?.[t.id].used} />) ?? <BlinkField />}</td>
                  <td><StoreTypeLabel type={getType(t.typeId)} /></td>
                  <td>
                    {userDatas
                      ? userDatas?.[t.userId]?.name || '-'
                      : <BlinkField />}
                  </td>
                  <td>
                    {t.hashId && ticketUsers?.[t.hashId]?.usableUserId
                      ? (t.id && getUsableUser(t.id)?.name) || <BlinkField />
                      : '-'}
                  </td>
                  <td><Link to={`/dashboard/tickets/${t.hashId}`}>{t.hashId}</Link></td>
                  <td>{formatByDate(t.updatedAt ?? t.createdAt, 'YYYY/MM/DD H:mm:ss')}</td>
                </tr>)
              : <tr>
                <td colSpan={6}>申し込まれているチケットがありません</td>
              </tr>}
          </tbody>
        </table>}

    </DashboardBaseLayout>
  )
}

export default DashboardStoreDetailPage
