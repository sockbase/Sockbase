import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { IconMTicket } from 'react-fluentui-emoji/lib/modern'
import {
  type SockbaseStoreDocument,
  type SockbaseTicketUserDocument
} from 'sockbase'
import useStore from '../../hooks/useStore'
import useDayjs from '../../hooks/useDayjs'
import useFirebase from '../../hooks/useFirebase'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import CopyToClipboard from '../../components/Parts/CopyToClipboard'
import BlinkField from '../../components/Parts/BlinkField'
import LinkButton from '../../components/Parts/LinkButton'
import Alert from '../../components/Parts/Alert'
import TicketUsedStatusLabel from '../../components/Parts/StatusLabel/TicketUsedStatusLabel'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'

const DashboardMyTicketDetailPage: React.FC = () => {
  const { hashedTicketId } = useParams<{ hashedTicketId: string }>()
  const { user } = useFirebase()
  const { formatByDate } = useDayjs()
  const {
    getTicketUserByHashIdOptionalAsync,
    getStoreByIdAsync
  } = useStore()

  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument | null>()
  const [store, setStore] = useState<SockbaseStoreDocument>()

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!hashedTicketId) return

      getTicketUserByHashIdOptionalAsync(hashedTicketId)
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
    <DashboardBaseLayout title={ticketUser && store ? (pageTitle ?? '') : 'マイチケット情報'}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/mytickets">マイチケット</Link></li>
      </Breadcrumbs>
      <PageTitle title={pageTitle} icon={<IconMTicket />} description="マイチケット情報" isLoading={!store} />

      {user && ticketUser?.userId === user.uid && !ticketUser.usableUserId &&
        <Alert type="danger" title="チケットの割り当てが完了していません">
          購入したチケットを使用するためには、まずチケットの割り当てを行う必要があります。<br />
          <Link to={`/dashboard/tickets/${hashedTicketId}`}>こちら</Link> から割り当てを行ってください。
        </Alert>}
      {ticketUser === null || (ticketUser && user && (ticketUser.userId !== user.uid && ticketUser.usableUserId !== user.uid) &&
        <Alert type="danger" title="チケットの取得に失敗しました">
          自分が購入していない, 割り当てられていないチケットの情報は表示できません。
        </Alert>)}

      {user && ticketUser?.usableUserId &&
        <TwoColumnsLayout>
          <>
            {ticketUser.hashId && !ticketUser.used && <FormSection>
              <FormItem>
                <LinkButton to={`/tickets/${ticketUser.hashId}`}>チケットを表示</LinkButton>
              </FormItem>
            </FormSection>}

            <h3>ステータス</h3>
            <table>
              <tbody>
                <tr>
                  <th>使用状況</th>
                  <td>{(ticketUser && <TicketUsedStatusLabel status={ticketUser.used} />) ?? <BlinkField />}</td>
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
            {ticketUser.userId === ticketUser.usableUserId && <FormSection>
              <FormItem>
                <LinkButton to={`/dashboard/tickets/${ticketUser.hashId}`} color="default">チケット管理ページ</LinkButton>
              </FormItem>
            </FormSection>}
          </>
          <>
          </>
        </TwoColumnsLayout>}
    </DashboardBaseLayout>
  )
}

export default DashboardMyTicketDetailPage
