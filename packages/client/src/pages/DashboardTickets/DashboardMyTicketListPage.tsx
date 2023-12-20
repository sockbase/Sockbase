import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { MdLocalActivity } from 'react-icons/md'
import {
  type SockbaseStoreType,
  type SockbaseStoreDocument,
  type SockbaseTicketUserDocument
} from 'sockbase'
import useStore from '../../hooks/useStore'
import useDayjs from '../../hooks/useDayjs'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import TicketCard from '../../components/Parts/TicketCard'
import Loading from '../../components/Parts/Loading'
import Alert from '../../components/Parts/Alert'

const DashboardMyTicketsPage: React.FC = () => {
  const { getUsableTicketsAsync, getStoreByIdAsync } = useStore()
  const { formatByDate } = useDayjs()

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

  const unusedTicketUsers = useMemo((): SockbaseTicketUserDocument[] => {
    if (!ticketUsers) return []
    return ticketUsers
      .filter(t => !t.used)
  }, [ticketUsers])

  const usedTicketUsers = useMemo((): SockbaseTicketUserDocument[] => {
    if (!ticketUsers) return []
    return ticketUsers
      .filter(t => t.used)
      .sort((a, b) => (b.usedAt?.getTime() ?? 9) - (a.usedAt?.getTime() ?? 0))
  }, [ticketUsers])

  const getStore = (storeId: string): SockbaseStoreDocument | undefined => {
    if (!stores) return
    const store = stores
      .filter(s => s.id === storeId)[0]
    return store
  }

  const getType = (storeId: string, typeId: string): SockbaseStoreType | undefined => {
    const store = getStore(storeId)
    return store?.types
      .filter(t => t.id === typeId)[0]
  }

  return (
    <DashboardBaseLayout title="マイチケット" requireSystemRole={0}>
      <Breadcrumbs>
        <li><Link to="/dashboard/">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle title="マイチケット" icon={<MdLocalActivity />} description="あなたに割り当てられているチケットを表示中" />

      {ticketUsers === undefined
        ? <Loading text='マイチケット' />
        : <>
          {unusedTicketUsers
            ? unusedTicketUsers.length !== 0
              ? <>
                <Alert title="購入したチケットが見つからない場合">
                  購入したチケットは <Link to="/dashboard/tickets">購入済みチケット一覧</Link> で確認できます。
                </Alert>
                <TicketsRack>
                  {unusedTicketUsers
                    .map(t => <TicketCard
                      key={t.hashId}
                      ticketUser={t}
                      store={getStore(t.storeId)}
                      type={getType(t.storeId, t.typeId)} />)}
                </TicketsRack>
              </>
              : <p>
                割り当てられているチケットはありません。<br />
                ご自身で購入したチケットは <Link to="/dashboard/tickets">購入済みチケット一覧</Link> からご確認ください。
              </p>
            : <Loading text="チケット一覧" />}

            <h2>使用済みチケット</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>チケット名</th>
                  <th>チケット種別</th>
                  <th>使用日</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {usedTicketUsers.length !== 0
                  ? usedTicketUsers
                    .map((t, i) => <tr key={t.hashId}>
                        <td>{i + 1}</td>
                        <th>{getStore(t.storeId)?.storeName}</th>
                        <td>{getType(t.storeId, t.typeId)?.name}</td>
                        <td>{formatByDate(t.usedAt, 'YYYY年M月D日 H時mm分')}</td>
                        <td><Link to={`/dashboard/mytickets/${t.hashId}`}>詳細</Link></td>
                      </tr>)
                  : <tr>
                    <td colSpan={5}>使用済みチケットはありません。</td>
                  </tr>}
              </tbody>
            </table>
          </>}
    </DashboardBaseLayout >
  )
}

export default DashboardMyTicketsPage

const TicketsRack = styled.section`
  margin-bottom: 20px;

  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  &:last-child {
    margin-bottom: 20px;
  }

  @media screen and (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
