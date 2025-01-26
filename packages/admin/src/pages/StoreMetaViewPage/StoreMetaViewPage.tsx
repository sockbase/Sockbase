import { useState, useEffect } from 'react'
import { MdGridView } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormInput from '../../components/Form/FormInput'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import CopyToClipboard from '../../components/Parts/CopyToClipboard'
import PageTitle from '../../components/Parts/PageTitle'
import StoreInfo from '../../components/Parts/StoreInfo'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import envHelper from '../../helpers/envHelper'
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
    <DefaultLayout
      requireCommonRole={2}
      title="チケットストアメタ情報">
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
            store={store}
            storeId={storeId} />
        </>
        <>
          <h2>管理</h2>
          <p>
            設定データをコピー <CopyToClipboard content={JSON.stringify(store)} />
          </p>

          <h2>申し込みタグ</h2>
          <FormSection>
            <FormItem>
              <FormInput
                readOnly
                value={`<a class="sb_button" href="${envHelper.userAppURL}/stores/${storeId}" rel="noreferrer" target="_blank">Sockbaseで申し込む</a><script src="${envHelper.userAppURL}/shared/sb-button.js"></script>`} />
            </FormItem>
          </FormSection>
        </>
      </TwoColumnLayout>
    </DefaultLayout>
  )
}

export default StoreMetaViewPage
