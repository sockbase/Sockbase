import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { type SockbaseAccount, type SockbaseStoreDocument, type SockbaseTicketUserDocument } from 'sockbase'
import DefaultLayout from '../../components/Layout/Default/Default'
import StepContainer from '../../components/pages/public/TicketAssign/StepContainer'
import Loading from '../../components/Parts/Loading'
import Alert from '../../components/Parts/Alert'
import useStore from '../../hooks/useStore'
import useUserData from '../../hooks/useUserData'

const TicketAssign: React.FC = () => {
  const [searchParams] = useSearchParams({ thi: '' })
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
    <DefaultLayout title={pageTitle}>
      {userData?.email && <Alert>
        {userData.email} としてログイン中です
      </Alert>}
      {ticketHashId
        && (ticketUser === undefined || !store || userData === undefined)
        && <Loading text="チケット情報" />}
      {ticketHashId
        && ticketUser && !ticketUser.usableUserId && store && userData !== undefined
        && <StepContainer ticketHashId={ticketHashId} ticketUser={ticketUser} store={store} userData={userData} />}

      {ticketHashId && ticketUser?.usableUserId
        && <Alert type="danger" title="受け取り済みのチケットです">
          このチケットは既に受け取り済みです。
        </Alert>}
      {(!ticketHashId || ticketUser === null)
        && <Alert type="danger" title="チケット情報が見つかりませんでした">
          URLが間違っています。
        </Alert>}
    </DefaultLayout>
  )
}

export default TicketAssign
