import { useState, useEffect } from 'react'
import { MdGroup } from 'react-icons/md'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import useOrganization from '../../hooks/useOrganization'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseOrganizationDocument } from 'sockbase'

const OrganizationListPage: React.FC = () => {
  const { getOrganizationsAsync } = useOrganization()

  const [organizations, setOrganizations] = useState<SockbaseOrganizationDocument[]>()

  useEffect(() => {
    getOrganizationsAsync()
      .then(setOrganizations)
      .catch(err => { throw err })
  }, [])

  return (
    <DefaultLayout
      requireSystemRole={2}
      title="組織一覧">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdGroup />}
        title="組織一覧" />

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>名前</th>
          </tr>
        </thead>
        <tbody>
          {!organizations && (
            <tr>
              <td colSpan={2}>読み込み中…</td>
            </tr>
          )}
          {organizations?.map(organization => (
            <tr key={organization.id}>
              <td><Link to={`/organizations/${organization.id}`}>{organization.id}</Link></td>
              <td>{organization.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DefaultLayout>
  )
}

export default OrganizationListPage
