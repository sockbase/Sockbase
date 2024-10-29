import { useState, useEffect } from 'react'
import { MdGridView } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import CopyToClipboard from '../../components/Parts/CopyToClipboard'
import PageTitle from '../../components/Parts/PageTitle'
import StoreInfo from '../../components/Parts/StoreInfo'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import useStore from '../../hooks/useStore'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseStore } from 'sockbase'

const StoreMetaViewPage: React.FC = () => {
  const { storeId } = useParams()
  const { getStoreByIdAsync } = useStore()

  const [store, setStore] = useState<SockbaseStore>()

  useEffect(() => {
    if (!storeId) return
    getStoreByIdAsync(storeId)
      .then(setStore)
      .catch(err => { throw err })
  }, [storeId])

  return (
    <DefaultLayout title="チケットストアメタ情報">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/stores">チケットストア一覧</Link></li>
        <li>{store?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/stores/${storeId}`}>{store?.name ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdGridView />}
        title="チケットストアメタ情報" />

      <TwoColumnLayout>
        <>
          <h2>チケットストア情報</h2>

          <StoreInfo
            storeId={storeId}
            store={store} />
        </>
        <>
          <h2>管理</h2>
          <p>
            設定データをコピー <CopyToClipboard content={JSON.stringify(store)} />
          </p>
        </>
      </TwoColumnLayout>
    </DefaultLayout>
  )
}

export default StoreMetaViewPage
