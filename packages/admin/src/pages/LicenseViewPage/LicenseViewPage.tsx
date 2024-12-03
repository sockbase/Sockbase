import { MdBadge } from 'react-icons/md'
import { Link } from 'react-router-dom'
import sockbaseShared from 'shared'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import useFirebase from '../../hooks/useFirebase'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const LicensePage: React.FC = () => {
  const { user, roles } = useFirebase()

  return (
    <DefaultLayout title="権限">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdBadge />}
        title="権限" />

      <h2>ユーザ情報</h2>
      <table>
        <tbody>
          <tr>
            <th>ユーザ ID</th>
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
          {roles && Object.entries(roles)
            .sort(([, a], [, b]) => b - a)
            .map(([k, v]) => (
              <tr key={k}>
                <th>{k === 'system' ? 'システム管理' : k}</th>
                <td>{sockbaseShared.constants.user.roleText[v]} (アクセスレベル: {v})</td>
              </tr>
            ))}
        </tbody>
      </table>
    </DefaultLayout>
  )
}

export default LicensePage
