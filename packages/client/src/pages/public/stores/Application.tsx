import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { type SockbaseStore } from 'sockbase'

import useStore from '../../../hooks/useStore'
import useFirebase from '../../../hooks/useFirebase'

import DefaultLayout from '../../../components/Layout/Default/Default'
import StepContainerComponent from '../../../components/pages/stores/Application/StepContainer'
import Alert from '../../../components/Parts/Alert'
import Loading from '../../../components/Parts/Loading'

const TicketApplication: React.FC = () => {
  const params = useParams<{ storeId: string }>()
  const { getStoreByIdAsync } = useStore()
  const { isLoggedIn, user } = useFirebase()

  const [pageTitle, setPageTitle] = useState('')
  const [store, setStore] = useState<SockbaseStore | null | undefined>()

  const onChangeStore: () => void = () => {
    if (!params.storeId) return
    const storeId = params.storeId

    const f: () => Promise<void> = async () => {
      const fetchedStore = await getStoreByIdAsync(storeId)
      setStore(fetchedStore)

      if (fetchedStore) {
        setPageTitle(`${fetchedStore?.storeName} 申し込み受付`)
      }
    }
    f().catch(err => {
      throw err
    })
  }
  useEffect(onChangeStore, [params.storeId])

  return (
    <DefaultLayout title={pageTitle}>
      {
        store === undefined
          ? <Loading text="チケットストア情報" />
          : store === null
            ? <Alert type="danger" title="チケットストアが見つかりません">
              指定されたIDのチケットストアを見つけることができませんでした。<br />
              URLが正しく入力されていることを確認してください。
            </Alert>
            : params.storeId && isLoggedIn !== undefined && user !== undefined && store && <>
              {user?.email && <Alert>
                {user.email} としてログイン中です
              </Alert>}
              <StepContainerComponent storeId={params.storeId} store={store} isLoggedIn={isLoggedIn} />
            </>
      }
    </DefaultLayout>
  )
}

export default TicketApplication
