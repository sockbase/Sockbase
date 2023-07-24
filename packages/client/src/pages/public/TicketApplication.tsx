import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { type SockbaseStoreDocument } from 'sockbase'
import useStore from '../../hooks/useStore'
import DefaultLayout from '../../components/Layout/Default/Default'
import StepContainerComponent from '../../components/pages/events/Ticket/StepContainer'
import Loading from '../../components/Parts/Loading'
import Alert from '../../components/Parts/Alert'
import useFirebase from '../../hooks/useFirebase'

const TicketApplication: React.FC = () => {
  const { user, isLoggedIn } = useFirebase()
  const { storeId } = useParams<{ storeId: string }>()
  const { getStoreByIdOptionalAsync } = useStore()

  const [store, setStore] = useState<SockbaseStoreDocument | null>()

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!storeId) return

      const fetchedStore = await getStoreByIdOptionalAsync(storeId)
      setStore(fetchedStore)

    }
    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [])

  const pageTitle = useMemo(() => store && `${store.storeName} チケット申し込みフォーム` || '', [store])

  return (
    <DefaultLayout title={pageTitle}>
      {store === undefined
        ? <Loading text="チケットストア情報" />
        : store === null
          ? <Alert type="danger" title="チケットストアが見つかりません">
            指定されたIDのチケットストアを見つけることができませんでした。<br />
            URLが正しく入力されていることを確認してください。
          </Alert>
          : store && isLoggedIn !== undefined
            ? <>
              {user?.email && <Alert>
                {user.email} としてログイン中です
              </Alert>}
              <StepContainerComponent store={store} isLoggedIn={isLoggedIn} />
            </>
            : <></>}
    </DefaultLayout >
  )
}

export default TicketApplication
