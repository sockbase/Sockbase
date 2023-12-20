import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { type SockbaseAccount, type SockbaseStoreDocument, type SockbaseTicketUserDocument } from 'sockbase'
import useStore from '../../hooks/useStore'
import useUserData from '../../hooks/useUserData'
import useFirebase from '../../hooks/useFirebase'
import DefaultBaseLayout from '../../components/Layout/DefaultBaseLayout/DefaultBaseLayout'
import StepContainer from './StepContainer/StepContainer'
import Loading from '../../components/Parts/Loading'
import Alert from '../../components/Parts/Alert'
import FormSection from '../../components/Form/FormSection'
import FormItem from '../../components/Form/FormItem'
import LinkButton from '../../components/Parts/LinkButton'

const TicketAssignPage: React.FC = () => {
  const [searchParams] = useSearchParams({ thi: '' })
  const { isLoggedIn, user } = useFirebase()
  const { getTicketUserByHashIdOptionalAsync, getStoreByIdAsync } = useStore()
  const { getMyUserDataAsync } = useUserData()

  const [ticketHashId, setTicketHashId] = useState<string>()
  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument | null>()
  const [store, setStore] = useState<SockbaseStoreDocument>()
  const [userData, setUserData] = useState<SockbaseAccount | null>()

  const onInitialize = (): void => {
    const paramTicketHashId = searchParams.get('thi')
    if (!paramTicketHashId) return

    setTicketHashId(paramTicketHashId)
  }
  useEffect(onInitialize, [searchParams])

  const onChangeHashId = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!ticketHashId) return

      const fetchedTicketUser = await getTicketUserByHashIdOptionalAsync(ticketHashId)
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
  }
  useEffect(onChangeHashId, [ticketHashId, getMyUserDataAsync])

  const pageTitle = useMemo(
    () => store ? `${store.storeName} 受け取りページ` : '読み込み中',
    [store])

  return (
    <DefaultBaseLayout title={pageTitle}>
      {userData?.email && <Alert>
        {userData.email} としてログイン中です
      </Alert>}
      {ticketHashId &&
        (ticketUser === undefined || !store || userData === undefined) &&
        <Loading text="チケット情報" />}
      {ticketHashId && isLoggedIn !== undefined &&
        ticketUser && !ticketUser.usableUserId && store && userData !== undefined &&
        <StepContainer isLoggedIn={isLoggedIn} ticketHashId={ticketHashId} ticketUser={ticketUser} store={store} userData={userData} />}

      {ticketHashId && ticketUser?.usableUserId &&
        <>
          <Alert type="danger" title="受け取り済みのチケットです">
            このチケットは既に受け取り済みです。
          </Alert>
          {user?.uid === ticketUser.usableUserId && <FormSection>
            <FormItem>
              <LinkButton to={`/tickets/${ticketHashId}`}>チケットを開く</LinkButton>
            </FormItem>
          </FormSection>}
        </>
      }
      {(!ticketHashId || ticketUser === null) &&
        <Alert type="danger" title="チケット情報が見つかりませんでした">
          URLが間違っています。
        </Alert>}
    </DefaultBaseLayout>
  )
}

export default TicketAssignPage
