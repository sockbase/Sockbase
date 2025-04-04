import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Alert from '../../../components/Parts/Alert'
import Loading from '../../../components/Parts/Loading'
import useFirebase from '../../../hooks/useFirebase'
import useStore from '../../../hooks/useStore'
import useUserData from '../../../hooks/useUserData'
import DefaultBaseLayout from '../../../layouts/DefaultBaseLayout/DefaultBaseLayout'
import StepContainer from './StepContainer/StepContainer'
import type { SockbaseStoreDocument, SockbaseAccount, SockbaseTicketUserDocument } from 'sockbase'

const TicketAssignPage: React.FC = () => {
  const [searchParams] = useSearchParams({ thi: '' })
  const {
    user,
    loginByEmailAsync,
    logoutAsync,
    createUserAsync
  } = useFirebase()
  const {
    getTicketUserByHashIdNullableAsync,
    getStoreByIdAsync,
    assignTicketUserAsync
  } = useStore()
  const {
    getMyUserDataAsync,
    updateUserDataAsync,
    updateUserDataWithStoreIdAsync
  } = useUserData()

  const ticketHashId = useMemo(() => searchParams.get('thi') ?? undefined, [searchParams])

  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument | null>()
  const [store, setStore] = useState<SockbaseStoreDocument>()

  const [userData, setUserData] = useState<SockbaseAccount | null>()

  const handleLoginAsync = useCallback(async (email: string, password: string) => {
    await loginByEmailAsync(email, password)
      .catch(err => { throw err })
  }, [])

  const handleLogoutAsync = useCallback(async () => {
    logoutAsync()
      .catch(err => { throw err })
  }, [])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!ticketHashId) return

      const fetchedTicketUser = await getTicketUserByHashIdNullableAsync(ticketHashId)
      setTicketUser(fetchedTicketUser)

      if (!fetchedTicketUser) return

      getStoreByIdAsync(fetchedTicketUser.storeId)
        .then(fetchedStore => setStore(fetchedStore))
        .catch(err => { throw err })

      getMyUserDataAsync()
        .then(fetchedUserData => setUserData(fetchedUserData))
        .catch(err => { throw err })
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [ticketHashId, getMyUserDataAsync])

  useEffect(() => {
    const handleBeforeUnloadEvent = (event: BeforeUnloadEvent): void => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnloadEvent)
    return () => window.removeEventListener('beforeunload', handleBeforeUnloadEvent)
  }, [])

  return (
    <DefaultBaseLayout title="チケット受け取りページ">
      {(ticketHashId === undefined || store === undefined || ticketUser === undefined) && (
        <Loading text="チケットストア情報" />
      )}

      {(ticketUser === null || !ticketHashId) && (
        <Alert
          title="チケット情報が見つかりません"
          type="error">
          チケット情報を取得できませんでした。<br />
          URL をもう一度お確かめください。
        </Alert>
      )}

      {store && ticketHashId && ticketUser && (
        <StepContainer
          assignTicketUserAsync={assignTicketUserAsync}
          createUserAsync={createUserAsync}
          loginAsync={handleLoginAsync}
          logoutAsync={handleLogoutAsync}
          store={store}
          ticketHashId={ticketHashId}
          ticketUser={ticketUser}
          updateUserDataAsync={updateUserDataAsync}
          updateUserDataWithStoreIdAsync={updateUserDataWithStoreIdAsync}
          user={user}
          userData={userData} />
      )}
    </DefaultBaseLayout>
  )
}

export default TicketAssignPage
