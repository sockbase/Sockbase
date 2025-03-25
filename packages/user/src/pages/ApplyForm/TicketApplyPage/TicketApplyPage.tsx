import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import useFirebase from '../../../hooks/useFirebase'
import useStore from '../../../hooks/useStore'
import useUserData from '../../../hooks/useUserData'
import useVoucher from '../../../hooks/useVoucher'
import DefaultBaseLayout from '../../../layouts/DefaultBaseLayout/DefaultBaseLayout'
import StepContainer from './StepContainer/StepContainer'
import type { SockbaseAccount, SockbaseStoreDocument } from 'sockbase'

const TicketApplyPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>()
  const {
    user,
    loginByEmailAsync,
    logoutAsync,
    createUserAsync
  } = useFirebase()
  const { getStoreByIdOptionalAsync, createTicketAsync } = useStore()
  const { updateUserDataAsync, getMyUserDataAsync } = useUserData()
  const { getVoucherByCodeAsync } = useVoucher()

  const [store, setStore] = useState<SockbaseStoreDocument | null>()

  const [userData, setUserData] = useState<SockbaseAccount | null>()

  const pageTitle = useMemo(() => {
    if (!store) return
    return `${store.name} 申し込み受付ページ`
  }, [store])

  const handleLoginAsync = useCallback(async (email: string, password: string) => {
    await loginByEmailAsync(email, password)
      .catch(err => { throw err })
  }, [])

  const handleLogoutAsync = useCallback(async () => {
    logoutAsync()
      .catch(err => { throw err })
  }, [])

  const handleGetVoucherCodeAsync = useCallback(async (eventId: string, typeId: string, code: string) => {
    return getVoucherByCodeAsync(2, eventId, typeId, code)
  }, [])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!storeId) return
      getStoreByIdOptionalAsync(storeId)
        .then(fetchedStore => setStore(fetchedStore))
        .catch(err => {
          setStore(null)
          throw err
        })
      getMyUserDataAsync()
        .then(fetchedUserData => setUserData(fetchedUserData))
        .catch(err => { throw err })
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [storeId, getMyUserDataAsync])

  useEffect(() => {
    const handleBeforeUnloadEvent = (event: BeforeUnloadEvent): void => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnloadEvent)
    return () => window.removeEventListener('beforeunload', handleBeforeUnloadEvent)
  }, [])

  return (
    <DefaultBaseLayout title={pageTitle}>
      <StepContainer
        createTicketAsync={createTicketAsync}
        createUserAsync={createUserAsync}
        getVoucherCodeAsync={handleGetVoucherCodeAsync}
        loginAsync={handleLoginAsync}
        logoutAsync={handleLogoutAsync}
        store={store}
        updateUserDataAsync={updateUserDataAsync}
        user={user}
        userData={userData} />
    </DefaultBaseLayout>
  )
}

export default TicketApplyPage
