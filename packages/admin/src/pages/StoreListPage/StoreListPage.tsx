import { useEffect, useState } from 'react'
import { MdAdd, MdStore } from 'react-icons/md'
import { Link } from 'react-router-dom'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import LinkButton from '../../components/Parts/LinkButton'
import PageTitle from '../../components/Parts/PageTitle'
import useFirebase from '../../hooks/useFirebase'
import useRole from '../../hooks/useRole'
import useStore from '../../hooks/useStore'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseStoreDocument } from 'sockbase'

const StoreListPage: React.FC = () => {
  const { roles } = useFirebase()
  const { isSystemAdmin } = useRole()
  const { getStoresByOrganizationIdAsync } = useStore()

  const [stores, setStores] = useState<Record<string, SockbaseStoreDocument[]>>()

  useEffect(() => {
    if (!roles) return

    const orgIds = Object.keys(roles)
      .filter(id => id !== 'system')
      .filter(id => roles[id] >= 2)

    Promise.all(orgIds.map(async id => ({
      id,
      data: await getStoresByOrganizationIdAsync(id)
    })))
      .then(e => e.reduce<Record<string, SockbaseStoreDocument[]>>((p, c) => ({ ...p, [c.id]: c.data }), {}))
      .then(setStores)
      .catch(err => { throw err })
  }, [roles])

  return (
    <DefaultLayout title='チケットストア管理' requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdStore />}
        title="チケットストア管理" />

      {isSystemAdmin && <FormSection>
        <FormItem>
          <LinkButton to="/events/create" disabled>
            <IconLabel icon={<MdAdd />} label='イベント作成' />
          </LinkButton>
        </FormItem>
      </FormSection>}

      <ul>
        {stores && Object.entries(stores).map(([id, sts]) => (
          <li key={id}>{id}
            <ul>
              {sts.map(s =>
                <li key={s.id}>
                  <Link to={`/stores/${s.id}`}>{s.name}</Link> {s.venue && `@${s.venue.name}`}
                </li>)}
            </ul>
          </li>))}
      </ul>
    </DefaultLayout>
  )
}

export default StoreListPage
