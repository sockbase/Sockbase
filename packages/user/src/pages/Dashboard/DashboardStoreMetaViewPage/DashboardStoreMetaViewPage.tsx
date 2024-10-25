import { useEffect, useState } from 'react'
import { MdStore } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import { type SockbaseStore } from 'sockbase'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormTextarea from '../../../components/Form/Textarea'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import StoreInfo from '../../../components/Parts/StoreInfo'
import useStore from '../../../hooks/useStore'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../layouts/TwoColumnsLayout/TwoColumnsLayout'

const DashboardStoreMetaViewPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>()
  const { getStoreByIdAsync } = useStore()

  const [store, setStore] = useState<SockbaseStore>()

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!storeId) return
      getStoreByIdAsync(storeId)
        .then(fetchedStore => setStore(fetchedStore))
        .catch(err => { throw err })
    }

    fetchAsync()
      .catch(err => { throw err })
  }, [storeId])

  return (
    <DashboardBaseLayout title="チケットストアメタ情報">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li>管理チケットストア</li>
        <li>{store?._organization.name}</li>
        <li><Link to={`/dashboard/stores/${storeId}`}>{store?.name}</Link></li>
      </Breadcrumbs>

      <PageTitle
        title={store?.name}
        description="チケットストアメタ情報"
        icon={<MdStore />}
        isLoading={!store} />

      <TwoColumnsLayout>
        <>
          <h2>チケットストア情報</h2>
          <StoreInfo
            storeId={storeId}
            store={store} />
        </>
        <>
          <h2>管理</h2>

          <h3>チケットストア設定データ</h3>
          <FormSection>
            <FormItem>
              <FormTextarea value={JSON.stringify(store)} disabled />
            </FormItem>
          </FormSection>
        </>
      </TwoColumnsLayout>
    </DashboardBaseLayout>
  )
}

export default DashboardStoreMetaViewPage
