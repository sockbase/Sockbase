import { useEffect, useState } from 'react'
import { MdAccountBox } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import { SockbaseAccountDocument, SockbaseApplicationDocument, SockbaseTicketDocument, SockbaseTicketUserDocument } from 'sockbase'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import useApplication from '../../hooks/useApplication'
import useStore from '../../hooks/useStore'
import useUser from '../../hooks/useUser'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const UserViewPage: React.FC = () => {
  const { userId } = useParams()
  const { getUserAsync } = useUser()
  const { getApplicationsByUserIdAsync } = useApplication()
  const { getTicketsByUserIdAsync, getUsableTicketsByUserIdAsync } = useStore()

  const [user, setUser] = useState<SockbaseAccountDocument>()
  const [apps, setApps] = useState<SockbaseApplicationDocument[]>()
  const [tickets, setTickets] = useState<SockbaseTicketDocument[]>()
  const [usableTickets, setUsableTickets] = useState<SockbaseTicketUserDocument[]>()

  useEffect(() => {
    if (!userId) return
    getUserAsync(userId)
      .then(setUser)
      .catch(err => { throw err })
    getApplicationsByUserIdAsync(userId)
      .then(setApps)
      .catch(err => { throw err })
    getTicketsByUserIdAsync(userId)
      .then(setTickets)
      .catch(err => { throw err })
    getUsableTicketsByUserIdAsync(userId)
      .then(setUsableTickets)
      .catch(err => { throw err })
  }, [userId])

  return (
    <DefaultLayout
      requireSystemRole={2}
      title="ユーザ情報">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/users">ユーザ一覧</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdAccountBox />}
        title="ユーザ情報閲覧" />

      <TwoColumnLayout>
        <>
          <h2>基礎情報</h2>
          <table>
            <tbody>
              <tr>
                <th>氏名</th>
                <td>{user?.name ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>メールアドレス</th>
                <td>{user?.email ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>ユーザ ID</th>
                <td>{user?.id ?? <BlinkField />}</td>
              </tr>
            </tbody>
          </table>
        </>
        <></>
      </TwoColumnLayout>

      <h2>各種情報</h2>

      <h3>申し込んだイベント</h3>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>イベント</th>
            <th>申し込み ID</th>
          </tr>
        </thead>
        <tbody>
          {!apps && (
            <tr>
              <td colSpan={3}>読み込み中…</td>
            </tr>
          )}
          {apps?.length === 0 && (
            <tr>
              <td colSpan={3}>申し込んだイベントはありません</td>
            </tr>
          )}
          {apps?.map((a, i) => (
            <tr key={a.id}>
              <td>{i + 1}</td>
              <td>{a.eventId}</td>
              <td><Link to={`/circles/${a.hashId}`}>{a.hashId}</Link></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>申し込んだチケット</h3>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>チケットストア</th>
            <th>申し込み ID</th>
          </tr>
        </thead>
        <tbody>
          {!tickets && (
            <tr>
              <td colSpan={3}>読み込み中…</td>
            </tr>
          )}
          {tickets?.length === 0 && (
            <tr>
              <td colSpan={3}>申し込んだチケットはありません</td>
            </tr>
          )}
          {tickets?.map((t, i) => (
            <tr key={t.id}>
              <td>{i + 1}</td>
              <td>{t.storeId}</td>
              <td><Link to={`/tickets/${t.hashId}`}>{t.hashId}</Link></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>受け取ったチケット</h3>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>チケットストア</th>
            <th>申し込み ID</th>
          </tr>
        </thead>
        <tbody>
          {!usableTickets && (
            <tr>
              <td colSpan={3}>読み込み中…</td>
            </tr>
          )}
          {usableTickets?.length === 0 && (
            <tr>
              <td colSpan={3}>受け取ったチケットはありません</td>
            </tr>
          )}
          {usableTickets?.map((t, i) => (
            <tr key={t.hashId}>
              <td>{i + 1}</td>
              <td>{t.storeId}</td>
              <td>{t.hashId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DefaultLayout>
  )
}

export default UserViewPage
