import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MdLocalPlay } from 'react-icons/md'
import {
  type SockbaseStoreDocument,
  type SockbaseTicketUserDocument
} from 'sockbase'
import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import PageTitle from '../../../components/Layout/Dashboard/PageTitle'
import TwoColumnsLayout from '../../../components/Layout/TwoColumns/TwoColumns'
import CopyToClipboard from '../../../components/Parts/CopyToClipboard'
import BlinkField from '../../../components/Parts/BlinkField'
import useStore from '../../../hooks/useStore'
import useDayjs from '../../../hooks/useDayjs'

const MyTicketDetail: React.FC = () => {
  const { hashedTicketId } = useParams<{ hashedTicketId: string }>()
  const { formatByDate } = useDayjs()
  const {
    getTicketUserByHashIdAsync,
    getStoreByIdAsync
  } = useStore()

  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument>()
  const [store, setStore] = useState<SockbaseStoreDocument>()

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!hashedTicketId) return

      getTicketUserByHashIdAsync(hashedTicketId)
        .then(fetchedTicketUser => setTicketUser(fetchedTicketUser))
        .catch(err => { throw err })
    }

    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [hashedTicketId])

  const onFetchedTicketUser = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!ticketUser) return

      getStoreByIdAsync(ticketUser.storeId)
        .then(fetchedStore => setStore(fetchedStore))
        .catch(err => { throw err })

      console.log(ticketUser)
    }

    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onFetchedTicketUser, [ticketUser])


  const pageTitle = useMemo(() => {
    if (!ticketUser || !store) return undefined
    const type = store.types
      .filter(t => t.id === ticketUser.typeId)[0]

    return `${store.storeName} (${type.name})`
  }, [ticketUser, store])

  return (
    <DashboardLayout title={ticketUser && store ? (pageTitle ?? '') : 'マイチケット情報'}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/mytickets">マイチケット</Link></li>
      </Breadcrumbs>
      <PageTitle title={pageTitle} icon={<MdLocalPlay />} description="マイチケット情報" isLoading={!store} />

      <TwoColumnsLayout>
        <>
          <h3>ステータス</h3>
          <table>
            <tbody>
              <tr>
                <th>使用状況</th>
                <td>{(ticketUser && (ticketUser?.used ? '使用済み' : '未使用')) ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>使用日</th>
                <td>{(ticketUser && (ticketUser?.usedAt ? formatByDate(ticketUser.usedAt, 'YYYY年M月D日 H時mm分') : '-')) ?? <BlinkField />}</td>
              </tr>
            </tbody>
          </table>

          <h3>チケット情報</h3>
          <table>
            <tbody>
              <tr>
                <th>チケットID</th>
                <td>{hashedTicketId} <CopyToClipboard content={hashedTicketId ?? ''} /></td>
              </tr>
            </tbody>
          </table>
        </>
        <></>
      </TwoColumnsLayout>
    </DashboardLayout>
  )
}

export default MyTicketDetail
