import { useEffect, useState } from 'react'
import { MdCalendarToday } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import useStore from '../../hooks/useStore'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseStoreDocument } from 'sockbase'

const StoreViewPage: React.FC = () => {
  const { storeId } = useParams()

  const { getStoreByIdAsync } = useStore()

  const [store, setStore] = useState<SockbaseStoreDocument>()

  useEffect(() => {
    if (!storeId) return

    getStoreByIdAsync(storeId)
      .then(setStore)
      .catch(err => { throw err })
  }, [storeId])

  return (
    <DefaultLayout title={store?.name ?? 'チケットストア情報'} requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/stores">チケットストア一覧</Link></li>
        <li>{store?._organization.name ?? <BlinkField />}</li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdCalendarToday />}
        title={store?.name}
        isLoading={!store} />
    </DefaultLayout>
  )
}

export default StoreViewPage
