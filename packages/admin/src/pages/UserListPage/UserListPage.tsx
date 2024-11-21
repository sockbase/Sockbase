import { useEffect, useState } from 'react'
import { MdManageAccounts } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import useUser from '../../hooks/useUser'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseAccountDocument } from 'sockbase'

const UserListPage: React.FC = () => {
  const { getUsersAsync } = useUser()

  const [users, setUsers] = useState<SockbaseAccountDocument[]>()

  useEffect(() => {
    getUsersAsync()
      .then(users => setUsers(users))
      .catch(err => { throw err })
  }, [])

  return (
    <DefaultLayout title="ユーザ一覧" requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>

      <PageTitle
        title="ユーザ一覧"
        icon={<MdManageAccounts />} />

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>名前</th>
            <th>メールアドレス</th>
          </tr>
        </thead>
        <tbody>
          {!users && (
            <tr>
              <td colSpan={3}>読み込み中…</td>
            </tr>
          )}
          {users?.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DefaultLayout>
  )
}

export default UserListPage
