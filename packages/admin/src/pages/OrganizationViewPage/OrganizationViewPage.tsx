import { useState, useEffect } from 'react'
import { MdGroup } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import useOrganization from '../../hooks/useOrganization'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseOrganizationDocument, SockbaseOrganizationManagerDocument } from 'sockbase'

const OrganizationViewPage: React.FC = () => {
  const { organizationId } = useParams()
  const { getOrganizationByIdAsync, getManagersByOrganizationIdAsync } = useOrganization()

  const [organization, setOrganization] = useState<SockbaseOrganizationDocument>()
  const [managers, setManagers] = useState<SockbaseOrganizationManagerDocument[]>()

  useEffect(() => {
    if (!organizationId) return
    getOrganizationByIdAsync(organizationId)
      .then(org => setOrganization(org))
      .catch(err => { throw err })
    getManagersByOrganizationIdAsync(organizationId)
      .then(managers => setManagers(managers))
      .catch(err => { throw err })
  }, [organizationId])

  return (
    <DefaultLayout title="組織情報照会" requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/organizations">組織一覧</Link></li>
      </Breadcrumbs>

      <PageTitle
        title="組織情報照会"
        icon={<MdGroup />} />

      <TwoColumnLayout>
        <>
          <h3>組織情報</h3>
          <table>
            <tbody>
              <tr>
                <th>ID</th>
                <td>{organization?.id ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>名前</th>
                <td>{organization?.name ?? <BlinkField />}</td>
              </tr>
            </tbody>
          </table>
        </>
        <>
          <h3>スタッフ一覧</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {!managers && (
                <tr>
                  <td colSpan={2}>Loading...</td>
                </tr>
              )}
              {managers?.map(manager => (
                <tr key={manager.userId}>
                  <td>{manager.userId}</td>
                  <td>{manager.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      </TwoColumnLayout>
    </DefaultLayout>
  )
}

export default OrganizationViewPage
