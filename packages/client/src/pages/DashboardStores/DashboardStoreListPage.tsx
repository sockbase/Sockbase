import { useEffect, useState } from 'react'
import { MdTableChart } from 'react-icons/md'
import { Link } from 'react-router-dom'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import LinkButton from '../../components/Parts/LinkButton'
import useFirebase from '../../hooks/useFirebase'
import useRole from '../../hooks/useRole'
import useStore from '../../hooks/useStore'
import type { SockbaseStoreDocument } from 'sockbase'

const DashboardStoreListPage: React.FC = () => {
  const { roles } = useFirebase()
  const { isSystemAdmin } = useRole()
  const { getStoresByOrganizationIdAsync } = useStore()

  const [stores, setStores] = useState<Record<string, SockbaseStoreDocument[]>>()

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!roles) return

      const orgIds = Object.keys(roles)
        .filter(id => id !== 'system')
        .filter(id => roles[id] >= 2)

      const fetchedStores = await Promise.all(orgIds.map(async id => ({
        id,
        data: await getStoresByOrganizationIdAsync(id)
      })))
        .then(s => s.reduce<Record<string, SockbaseStoreDocument[]>>((p, c) => ({
          ...p,
          [c.id]: c.data
        }), {}))
        .catch(err => { throw err })
      setStores(fetchedStores)
      console.log(fetchedStores)
    }

    fetchAsync()
      .catch(err => { throw err })
  }, [roles])

  return (
    <DashboardBaseLayout title="チケットストア一覧" requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>

      <PageTitle
        title="管理チケットストア"
        icon={<MdTableChart />}
        description="管理中のチケットストア一覧" />

      {isSystemAdmin && <FormSection>
        <FormItem inlined>
          <LinkButton to="/dashboard/stores/create" inlined>チケットストア作成</LinkButton>
        </FormItem>
      </FormSection>}

      <ul>
        {stores && Object.entries(stores).map(([id, sts]) => (
          <li key={id}>{id}
            <ul>
              {sts.map(s => <li key={s.id}>
                <Link to={`/dashboard/stores/${s.id}`}>{s.storeName}</Link>
              </li>)}
            </ul>
          </li>
        ))}
      </ul>
    </DashboardBaseLayout>
  )
}

export default DashboardStoreListPage
