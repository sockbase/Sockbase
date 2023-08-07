import DashboardLayout from '../../components/Layout/Dashboard/Dashboard'

import useFirebase from '../../hooks/useFirebase'

import { MdCottage } from 'react-icons/md'
import PageTitle from '../../components/Layout/Dashboard/PageTitle'
import useChat from '../../hooks/useChat'
import { useEffect } from 'react'

const DashboardContainer: React.FC = () => {
  const { user, roles } = useFirebase()
  const { startStream, messages } = useChat()

  useEffect(() => {
    if (!user) return

    startStream(user.uid)
  }, [user])

  useEffect(() => {
    console.log(messages)
  }, [messages])

  return (
    <DashboardLayout title="デバッグボード">
      <PageTitle
        icon={<MdCottage />}
        title="デバッグボード"
        description="デバッグ情報を表示します。" />

      <h2>ユーザー情報</h2>
      <table>
        <tbody>
          <tr>
            <th>ユーザID</th>
            <td>{user?.uid}</td>
          </tr>
          <tr>
            <th>メールアドレス</th>
            <td>{user?.email}</td>
          </tr>
        </tbody>
      </table>

      <h2>カスタムクレーム</h2>

      <h3>ロール</h3>
      {
        roles && Object.entries(roles).map(([k, v]) => <li key={k}>{k}: {v}</li>)
      }

    </DashboardLayout>
  )
}

export default DashboardContainer
