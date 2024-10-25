import { useEffect, useMemo, useState } from 'react'
import { MdCheck, MdClose, MdOutlineDeleteForever, MdPendingActions, MdWallet } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormButton from '../../components/Form/FormButton'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import PageTitle from '../../components/Parts/PageTitle'
import ApplicationStatusLabel from '../../components/StatusLabel/ApplicationStatusLabel'
import TicketAssignStatusLabel from '../../components/StatusLabel/TicketAssignStatusLabel'
import TicketUsedStatusLabel from '../../components/StatusLabel/TicketUsedStatusLabel'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import useRole from '../../hooks/useRole'
import useStore from '../../hooks/useStore'
import useUserData from '../../hooks/useUserData'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type {
  SockbaseTicketHashIdDocument,
  SockbaseStoreDocument,
  SockbaseTicketDocument,
  SockbaseTicketUsedStatus,
  SockbaseTicketUserDocument,
  SockbaseTicketMeta,
  SockbaseAccount
} from 'sockbase'

const TicketViewPage: React.FC = () => {
  const { hashId } = useParams()

  const {
    getTicketIdByHashIdAsync,
    getTicketByIdAsync,
    getStoreByIdAsync,
    getTicketMetaByIdAsync,
    getTicketUsedStatusByIdAsync,
    getTicketUserByHashIdAsync
  } = useStore()
  const { getUserDataByUserIdAndStoreIdAsync } = useUserData()
  const { isSystemAdmin } = useRole()

  const [ticketHash, setTicketHash] = useState<SockbaseTicketHashIdDocument>()
  const [ticket, setTicket] = useState<SockbaseTicketDocument>()
  const [ticketMeta, setTicketMeta] = useState<SockbaseTicketMeta>()
  const [ticketUsed, setTicketUsed] = useState<SockbaseTicketUsedStatus>()
  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument>()
  const [userData, setUserData] = useState<SockbaseAccount>()
  const [store, setStore] = useState<SockbaseStoreDocument>()

  const [isDeletedTicket] = useState(false)

  const ticketType = useMemo(() => {
    return store?.types.find(type => type.id === ticket?.typeId)
  }, [ticket, store])

  const pageTitle = useMemo(() => {
    if (!store || !ticketType) return undefined
    return `${store.name} (${ticketType.name})`
  }, [store, ticketType])

  useEffect(() => {
    if (!hashId) return
    getTicketIdByHashIdAsync(hashId)
      .then(setTicketHash)
      .catch(err => { throw err })
  }, [hashId])

  useEffect(() => {
    if (!ticketHash) return
    getTicketByIdAsync(ticketHash.ticketId)
      .then(setTicket)
      .catch(err => { throw err })
    getTicketMetaByIdAsync(ticketHash.ticketId)
      .then(setTicketMeta)
      .catch(err => { throw err })
    getTicketUsedStatusByIdAsync(ticketHash.ticketId)
      .then(setTicketUsed)
      .catch(err => { throw err })
    getTicketUserByHashIdAsync(ticketHash.hashId)
      .then(setTicketUser)
      .catch(err => { throw err })
  }, [ticketHash])

  useEffect(() => {
    if (!ticket) return
    getStoreByIdAsync(ticket.storeId)
      .then(setStore)
      .catch(err => { throw err })
    getUserDataByUserIdAndStoreIdAsync(ticket.userId, ticket.storeId)
      .then(setUserData)
      .catch(err => { throw err })
  }, [ticket])

  return (
    <DefaultLayout title={pageTitle ?? 'チケット情報照会'}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/stores">チケットストア一覧</Link></li>
        <li>{store?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/stores/${store?.id}`}>{store?.name ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdWallet />}
        title={pageTitle}
        isLoading={!pageTitle} />

      <TwoColumnLayout>
        <>
          <h3>ステータス</h3>
          <table>
            <tbody>
              <tr>
                <th>申し込み状況</th>
                <td><ApplicationStatusLabel status={ticketMeta?.applicationStatus} /></td>
              </tr>
              <tr>
                <th>お支払い状況</th>
                <td>TBD</td>
              </tr>
              <tr>
                <th>割り当て状況</th>
                <td><TicketAssignStatusLabel usableUserId={ticketUser?.usableUserId} /></td>
              </tr>
              <tr>
                <th>使用状況</th>
                <td><TicketUsedStatusLabel used={ticketUsed?.used} /></td>
              </tr>
            </tbody>
          </table>
        </>
        <>
          <h3>購入者情報</h3>
          <table>
            <tbody>
              <tr>
                <th>購入者氏名</th>
                <td>{userData?.name}</td>
              </tr>
              <tr>
                <th>メールアドレス</th>
                <td>{userData?.email}</td>
              </tr>
            </tbody>
          </table>
        </>
        <>
          <h3>基礎情報</h3>
          <table>
            <tbody>
              <tr>
                <th>ID</th>
                <td>{ticket?.hashId}</td>
              </tr>
            </tbody>
          </table>
        </>
      </TwoColumnLayout>
      <TwoColumnLayout>
        <>
          <h3>操作</h3>
          <FormSection>
            <FormItem $inlined>
              <FormButton>
                <IconLabel icon={<MdCheck />} label="申し込み確定状態にする" />
              </FormButton>
              <FormButton>
                <IconLabel icon={<MdPendingActions />} label='仮申し込み状態にする' />
              </FormButton>
              <FormButton>
                <IconLabel icon={<MdClose />} label='キャンセル状態にする' />
              </FormButton>
            </FormItem>
          </FormSection>
        </>
        {isSystemAdmin && (
          <>
            <h3>システム操作</h3>
            <FormSection>
              <FormItem>
                <FormButton disabled={isDeletedTicket}>
                  <IconLabel icon={<MdOutlineDeleteForever />} label='申し込み情報を削除する' />
                </FormButton>
              </FormItem>
            </FormSection>
          </>
        )}
      </TwoColumnLayout>
    </DefaultLayout>
  )
}

export default TicketViewPage
