import { useEffect, useMemo, useState } from 'react'
import { MdLocalActivity } from 'react-icons/md'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import {
  type SockbaseStoreType,
  type SockbaseStoreDocument,
  type SockbaseTicketUserDocument
} from 'sockbase'
import Alert from '../../../components/Parts/Alert'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import Loading from '../../../components/Parts/Loading'
import TicketCard from '../../../components/Parts/TicketCard'
import useDayjs from '../../../hooks/useDayjs'
import useStore from '../../../hooks/useStore'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'

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
    <DashboardBaseLayout title="マイチケット">
      <Breadcrumbs>
        <li><Link to="/dashboard/">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle
        description="あなたに割り当てられているチケットを表示中"
        icon={<MdLocalActivity />}
        title="マイチケット" />

      {ticketUsers === undefined
        ? <Loading text="マイチケット" />
        : (
          <>
            {unusedTicketUsers
              ? unusedTicketUsers.length !== 0
                ? (
                  <>
                    <TicketsRack>
                      {unusedTicketUsers
                        .map(t => (
                          <TicketCard
                            key={t.hashId}
                            store={getStore(t.storeId)}
                            ticketUser={t}
                            type={getType(t.storeId, t.typeId)} />
                        ))}
                    </TicketsRack>
                    <Alert
                      title="購入したチケットが見つからない場合"
                      type="info">
                    購入したチケットは <Link to="/dashboard/tickets">購入済みチケット一覧</Link> で確認できます。
                    </Alert>
                  </>
                )
                : (
                  <p>
                割り当てられているチケットはありません。<br />
                ご自身で購入したチケットは <Link to="/dashboard/tickets">購入済みチケット一覧</Link> からご確認ください。
                  </p>
                )
              : <Loading text="チケット一覧" />}

            <details>
              <summary>使用済みチケットの一覧</summary>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>チケット名</th>
                    <th>チケット種別</th>
                    <th>使用日</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {usedTicketUsers.length !== 0
                    ? usedTicketUsers
                      .map((t, i) => (
                        <tr key={t.hashId}>
                          <td>{i + 1}</td>
                          <th>{getStore(t.storeId)?.name}</th>
                          <td>{getType(t.storeId, t.typeId)?.name}</td>
                          <td>{formatByDate(t.usedAt, 'YYYY年 M月 D日 H時mm分')}</td>
                          <td><Link to={`/dashboard/mytickets/${t.hashId}`}>詳細</Link></td>
                        </tr>
                      ))
                    : (
                      <tr>
                        <td colSpan={5}>使用済みチケットはありません。</td>
                      </tr>
                    )}
                </tbody>
              </table>
            </details>
          </>
        )}
    </DashboardBaseLayout>
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
