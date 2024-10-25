import { useEffect, useState } from 'react'
import {
  MdAddCircleOutline,
  MdDataset,
  MdOpenInNew,
  MdStore
} from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import AnchorButton from '../../components/Parts/AnchorButton'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import LinkButton from '../../components/Parts/LinkButton'
import PageTitle from '../../components/Parts/PageTitle'
import envHelper from '../../helpers/envHelper'
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
        icon={<MdStore />}
        title={store?.name}
        isLoading={!store} />

      <FormSection>
        <FormItem $inlined>
          <LinkButton to="/">
            <IconLabel icon={<MdAddCircleOutline />} label='チケット手動発券' />
          </LinkButton>
          <LinkButton to="/">
            <IconLabel icon={<MdDataset />} label='メタ情報参照' />
          </LinkButton>
          <AnchorButton href={`${envHelper.userAppURL}/stores/${storeId}`} target="_blank">
            <IconLabel icon={<MdOpenInNew />} label='申し込みページを開く' />
          </AnchorButton>
        </FormItem>
      </FormSection>
    </DefaultLayout>
  )
}

export default StoreViewPage
