import { useState, useEffect, useCallback } from 'react'
import { MdDelete, MdGroup, MdSave } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormButton from '../../components/Form/FormButton'
import FormInput from '../../components/Form/FormInput'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/FormLabel'
import FormSection from '../../components/Form/FormSection'
import FormSelect from '../../components/Form/FormSelect'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import PageTitle from '../../components/Parts/PageTitle'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import useOrganization from '../../hooks/useOrganization'
import useRole from '../../hooks/useRole'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseOrganizationDocument, SockbaseRole } from 'sockbase'

const OrganizationViewPage: React.FC = () => {
  const { organizationId } = useParams()
  const {
    getOrganizationByIdAsync,
    getManagersByOrganizationIdAsync,
    setManagerAsync,
    removeManagerAsync
  } = useOrganization()
  const { isSystemAdmin } = useRole()

  const [organization, setOrganization] = useState<SockbaseOrganizationDocument>()
  const [managers, setManagers] = useState<Record<string, SockbaseRole>>()

  const [managerUserId, setManagerUserId] = useState('')
  const [role, setRole] = useState('')

  useEffect(() => {
    if (!organizationId) return
    getOrganizationByIdAsync(organizationId)
      .then(org => setOrganization(org))
      .catch(err => { throw err })
    getManagersByOrganizationIdAsync(organizationId)
      .then(fetchedManagers => {
        const mappedManagers = fetchedManagers.reduce<Record<string, SockbaseRole>>((p, c) => ({ ...p, [c.userId]: c.role }), {})
        setManagers(mappedManagers)
      })
      .catch(err => { throw err })
  }, [organizationId])

  const handleSetManager = useCallback(() => {
    if (!organizationId || !managerUserId) return

    const sanitizedRole = parseInt(role)
    if (isNaN(sanitizedRole)) return

    switch (sanitizedRole) {
      case 0:
      case 1:
      case 2:
        break
      default:
        return
    }

    setManagerAsync(organizationId, managerUserId, sanitizedRole)
      .then(() => {
        alert('反映しました')
        setManagers(s => s && ({ ...s, [managerUserId]: sanitizedRole }))
        setManagerUserId('')
        setRole('')
      })
      .catch(err => { throw err })
  }, [organizationId, managerUserId, role])

  const handleRemoveManager = useCallback((userId: string) => {
    if (!organizationId || !userId) return
    if (!confirm(`マネージャから ${userId} を削除します。\nよろしいですか？`)) return
    removeManagerAsync(organizationId, userId)
      .then(() => {
        alert('反映しました')
        setManagers(s => {
          if (!s) return s
          const { [userId]: _, ...rest } = s
          return rest
        })
      })
      .catch(err => { throw err })
  }, [])

  return (
    <DefaultLayout
      requireSystemRole={2}
      title="組織情報照会">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/organizations">組織一覧</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdGroup />}
        title="組織情報照会" />

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
                <th>組織名</th>
                <td>{organization?.name ?? <BlinkField />}</td>
              </tr>
            </tbody>
          </table>
        </>
        <>
          <h3>マネージャ一覧</h3>
          <table>
            <thead>
              <tr>
                <th>ユーザ ID</th>
                <th>ロール</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {!managers && (
                <tr>
                  <td colSpan={3}>Loading...</td>
                </tr>
              )}
              {managers && Object.entries(managers)?.map(([userId, role]) => (
                <tr key={userId}>
                  <td>{userId}</td>
                  <td>{role}</td>
                  <td>
                    <FormButton onClick={() => handleRemoveManager(userId)}>
                      <MdDelete />
                    </FormButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {isSystemAdmin && (
            <>
              <h3>マネージャ管理</h3>
              <FormSection>
                <FormItem>
                  <FormLabel>ユーザ ID</FormLabel>
                  <FormInput
                    onChange={e => setManagerUserId(e.target.value)}
                    value={managerUserId} />
                </FormItem>
                <FormItem>
                  <FormLabel>ロール</FormLabel>
                  <FormSelect
                    onChange={e => setRole(e.target.value)}
                    value={role}>
                    <option value="">ロールを選択</option>
                    <option value="0">0: ユーザ</option>
                    <option value="1">1: スタッフ</option>
                    <option value="2">2: 管理者</option>
                  </FormSelect>
                </FormItem>
              </FormSection>
              <FormSection>
                <FormItem>
                  <FormButton onClick={handleSetManager}>
                    <IconLabel
                      icon={<MdSave />}
                      label="設定" />
                  </FormButton>
                </FormItem>
              </FormSection>
            </>
          )}
        </>
      </TwoColumnLayout>
    </DefaultLayout>
  )
}

export default OrganizationViewPage
