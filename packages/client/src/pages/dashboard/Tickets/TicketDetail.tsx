import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MdLocalPlay } from 'react-icons/md'
import {
  type SockbaseAccount,
  type SockbaseStoreDocument,
  type SockbaseTicketDocument
} from 'sockbase'
import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import PageTitle from '../../../components/Layout/Dashboard/PageTitle'
import TwoColumnsLayout from '../../../components/Layout/TwoColumns/TwoColumns'
import CopyToClipboard from '../../../components/Parts/CopyToClipboard'
import BlinkField from '../../../components/Parts/BlinkField'
import useStore from '../../../hooks/useStore'
import useDayjs from '../../../hooks/useDayjs'
import useUserData from '../../../hooks/useUserData'

const TicketDetail: React.FC = () => {
  const { hashedTicketId } = useParams<{ hashedTicketId: string }>()
  const { formatByDate } = useDayjs()
  const { getTicketIdByHashIdAsync, getTicketByIdAsync, getStoreByIdAsync } = useStore()
  const { getUserDataByUserIdAndStoreIdAsync } = useUserData()

  const [ticket, setTicket] = useState<SockbaseTicketDocument>()
  const [store, setStore] = useState<SockbaseStoreDocument>()
  const [userData, setUserData] = useState<SockbaseAccount>()

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!hashedTicketId) return

      const fetchedTicketId = await getTicketIdByHashIdAsync(hashedTicketId)
      const fetchedTicket = await getTicketByIdAsync(fetchedTicketId.ticketId)
      setTicket(fetchedTicket)
    }

    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [])

  const onFetchedTicket = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!ticket) return

      getStoreByIdAsync(ticket.storeId)
        .then(fetchedStore => setStore(fetchedStore))
        .catch(err => { throw err })

      getUserDataByUserIdAndStoreIdAsync(ticket.userId, ticket.storeId)
        .then(fetchedUserData => setUserData(fetchedUserData))
        .catch(err => { throw err })
    }

    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onFetchedTicket, [ticket])


  const pageTitle = useMemo(() => {
    if (!ticket || !store) return undefined
    const type = store.types
      .filter(t => t.id === ticket.typeId)[0]

    return `${store.storeName} (${type.name})`
  }, [ticket, store])

  return (
    <DashboardLayout title={ticket && store ? (pageTitle ?? '') : 'チケット詳細'}>
      <Breadcrumbs>
        <li>マイページ</li>
        <li><Link to="/dashboard/tickets">所持チケット一覧</Link></li>
      </Breadcrumbs>
      <PageTitle title={pageTitle} icon={<MdLocalPlay />} description="所持チケット情報" isLoading={!store} />

      <TwoColumnsLayout>
        <>
          <h3>ステータス</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込み状況</th>
                <td><BlinkField /></td>
              </tr>
              <tr>
                <th>お支払い状況</th>
                <td><BlinkField /></td>
              </tr>
              <tr>
                <th>割り当て状況</th>
                <td><BlinkField /></td>
              </tr>
              <tr>
                <th>使用状況</th>
                <td><BlinkField /></td>
              </tr>
            </tbody>
          </table>

          <h3>購入者情報</h3>
          <table>
            <tbody>
              <tr>
                <th>購入者氏名</th>
                <td>{userData?.name ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>メールアドレス</th>
                <td>{userData?.email ?? <BlinkField />}</td>
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
              <tr>
                <th>申し込み日時</th>
                <td>{formatByDate(ticket?.createdAt, 'YYYY年M月D日 H時mm分ss秒') ?? <BlinkField />}</td>
              </tr>
            </tbody>
          </table>

        </>
        <></>
      </TwoColumnsLayout>
    </DashboardLayout>
  )
}

export default TicketDetail
