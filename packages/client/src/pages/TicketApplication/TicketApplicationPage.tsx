import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { type SockbaseAccount, type SockbaseStoreDocument } from 'sockbase'
import Alert from '../../components/Parts/Alert'
import Loading from '../../components/Parts/Loading'
import useFirebase from '../../hooks/useFirebase'
import useStore from '../../hooks/useStore'
import useUserData from '../../hooks/useUserData'
import DefaultBaseLayout from '../../layouts/DefaultBaseLayout/DefaultBaseLayout'
import StepContainerComponent from './StepContainer/StepContainer'

const TicketApplicationPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>()

  const { user, isLoggedIn } = useFirebase()
  const { getMyUserDataAsync } = useUserData()
  const { getStoreByIdOptionalAsync } = useStore()

  const [store, setStore] = useState<SockbaseStoreDocument | null>()
  const [userData, setUserData] = useState<SockbaseAccount | null>()

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!storeId) return

      const fetchedStore = await getStoreByIdOptionalAsync(storeId)
      setStore(fetchedStore)

      const fetchedUserData = await getMyUserDataAsync()
      setUserData(fetchedUserData)
    }

    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [getMyUserDataAsync])

  useEffect(() => {
    const handleBeforeUnloadEvent = (event: BeforeUnloadEvent): void => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnloadEvent)
    return () => window.removeEventListener('beforeunload', handleBeforeUnloadEvent)
  }, [])

  const pageTitle = useMemo(() => (store && `${store.storeName} チケット申し込みフォーム`) || '', [store])

  return (
    <DefaultBaseLayout title={pageTitle}>
      {store === undefined
        ? <Loading text="チケットストア情報" />
        : store === null
          ? <Alert type="danger" title="チケットストアが見つかりません">
            指定されたIDのチケットストアを見つけることができませんでした。<br />
            URLが正しく入力されていることを確認してください。
          </Alert>
          : store && isLoggedIn !== undefined && userData !== undefined
            ? <>
              {user?.email && <Alert>
                {user.email} としてログイン中です
              </Alert>}
              <StepContainerComponent user={user} store={store} isLoggedIn={isLoggedIn} userData={userData} />
            </>
            : <></>}
    </DefaultBaseLayout >
  )
}

export default TicketApplicationPage
