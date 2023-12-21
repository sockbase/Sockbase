import { useCallback } from 'react'
import { type SockbaseRole } from 'sockbase'
import { MdBadge } from 'react-icons/md'
import MainLayout from '../../components/Layouts/MainLayout/MainLayout'
import useFirebase from '../../hooks/useFirebase'

const LicensePage: React.FC = () => {
  const { user, roles } = useFirebase()

  const getRoleName = useCallback((role: SockbaseRole): string => {
    if (role === 0) {
      return 'ユーザ'
    } else if (role === 1) {
      return 'スタッフ'
    } else if (role === 2) {
      return '管理者'
    } else {
      return ''
    }
  }, [])

  return (
    <MainLayout
      title="権限"
      subTitle="付与されている権限情報を表示します。"
      icon={<MdBadge />}
      prevPage={{ path: '/', name: 'トップ' }}
    >
      <h2>ユーザ情報</h2>
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

      <h2>権限情報</h2>
      <table>
        <thead>
          <tr>
            <th>組織</th>
            <th>権限レベル</th>
          </tr>
        </thead>
        <tbody>
          {roles && Object.entries(roles).sort(([, a], [, b]) => b - a).map(([id, r]) => <tr key={id}>
            <th>{(id === 'system' && 'システム管理') || id}</th>
            <td>{getRoleName(r)}(アクセスレベル: {r})</td>
          </tr>)}
        </tbody>
      </table>
    </MainLayout>
  )
}

export default LicensePage
