import { Link } from 'react-router-dom'
import { IconMIdentificationCard } from 'react-fluentui-emoji/lib/modern'
import sockbaseShared from 'shared'

import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import useFirebase from '../../hooks/useFirebase'

const DashboardLicensePage: React.FC = () => {
  const { user, roles } = useFirebase()

  return (
    <DashboardBaseLayout title="権限" requireCommonRole={1}>
      <Breadcrumbs>
        <li><Link to='/dashboard'>マイページ</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<IconMIdentificationCard />}
        title="権限"
        description="付与されている権限情報を表示します" />

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
            .sort(([_a, a], [_b, b]) => b - a)
            .map(([k, v]) => <tr key={k}>
              <th>{k === 'system' ? 'システム管理' : k}</th>
              <td>{sockbaseShared.constants.user.roleText[v]} (アクセスレベル: {v})</td>
            </tr>)}
        </tbody>
      </table>

    </DashboardBaseLayout>
  )
}

export default DashboardLicensePage
