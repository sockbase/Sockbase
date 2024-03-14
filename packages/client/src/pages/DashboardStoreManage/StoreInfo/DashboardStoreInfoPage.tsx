import { useEffect, useState } from 'react'
import { MdStore } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import { type SockbaseStore } from 'sockbase'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormTextarea from '../../../components/Form/Textarea'
import DashboardBaseLayout from '../../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../components/Layout/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import StoreInfo from '../../../components/Parts/StoreInfo'
import useStore from '../../../hooks/useStore'

const DashboardStoreInfoPage: React.FC = () => {
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
    <DashboardBaseLayout title="チケットストアメタ情報" requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/stores">管理チケットストア</Link></li>
        <li>{store?._organization.name}</li>
        <li><Link to={`/dashboard/stores/${storeId}`}>{store?.storeName}</Link></li>
      </Breadcrumbs>

      <PageTitle
        title={store?.storeName}
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

export default DashboardStoreInfoPage
