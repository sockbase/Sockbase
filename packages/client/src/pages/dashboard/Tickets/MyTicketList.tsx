import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { MdLocalActivity } from 'react-icons/md'
import {
  type SockbaseStoreType,
  type SockbaseStoreDocument,
  type SockbaseTicketUserDocument
} from 'sockbase'
import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import PageTitle from '../../../components/Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import useStore from '../../../hooks/useStore'
import Loading from '../../../components/Parts/Loading'
import TicketCard from '../../../components/Parts/TicketCard'
import Alert from '../../../components/Parts/Alert'

const MyTickets: React.FC = () => {
  const { getUsableTicketsAsync, getStoreByIdAsync } = useStore()

  const [ticketUsers, setTicketUsers] = useState<SockbaseTicketUserDocument[]>()
  const [stores, setStores] = useState<SockbaseStoreDocument[]>()
  const [sortedTicketUsers, setSortedTicketUsers] = useState<SockbaseTicketUserDocument[]>()

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

  const onTicketUserFetched = (): void => {
    if (!ticketUsers) return
    const _sortedTicketUsers = [
      ...ticketUsers
        .filter(t => !t.used),
      ...ticketUsers
        .filter(t => t.used)
        .sort((a, b) => (b.usedAt?.getTime() ?? 9) - (a.usedAt?.getTime() ?? 0)),
    ]
    setSortedTicketUsers(_sortedTicketUsers)
  }
  useEffect(onTicketUserFetched, [ticketUsers])

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
    <DashboardLayout title="マイチケット">
      <Breadcrumbs>
        <li><Link to="/dashboard/">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle title="マイチケット" icon={<MdLocalActivity />} description="あなたに割り当てられているチケットを表示中" />

      {sortedTicketUsers
        ? sortedTicketUsers.length !== 0
          ? <>
            <Alert title="購入したチケットが見つからない場合">
              購入したチケットは <Link to="/dashboard/tickets">購入済みチケット一覧</Link> で確認できます。
            </Alert>
            <TicketsRack>
              {sortedTicketUsers
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

    </DashboardLayout >
  )
}

export default MyTickets

const TicketsRack = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media screen and (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
