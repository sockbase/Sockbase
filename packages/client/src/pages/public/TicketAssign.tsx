import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DefaultLayout from '../../components/Layout/Default/Default'
import StepContainer from '../../components/pages/public/TicketAssign/StepContainer'
import Loading from '../../components/Parts/Loading'
import { type SockbaseStoreDocument, type SockbaseTicketUserDocument } from 'sockbase'
import useStore from '../../hooks/useStore'
import Alert from '../../components/Parts/Alert'

const TicketAssign: React.FC = () => {
  const [searchParams] = useSearchParams({ thi: '' })

  const { getTicketUserByHashIdOptionalAsync, getStoreByIdAsync } = useStore()

  const [ticketHashId, setTicketHashId] = useState<string>()
  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument | null>()
  const [store, setStore] = useState<SockbaseStoreDocument>()

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

      const fetchedStore = await getStoreByIdAsync(fetchedTicketUser.storeId)
      setStore(fetchedStore)
    }

    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onChangeHashId, [ticketHashId])

  const pageTitle = useMemo(
    () => store ? `${store.storeName} 受け取りページ` : '読み込み中',
    [store])

  return (
    <DefaultLayout title={pageTitle}>
      {ticketUser && store && <StepContainer ticketUser={ticketUser} store={store} />}
      {ticketHashId && ticketUser === undefined && <Loading text="チケット情報" />}
      {(!ticketHashId || ticketUser === null) &&
        <Alert type="danger" title="チケット情報が見つかりませんでした">
          URLが間違っています。
        </Alert>}
    </DefaultLayout>
  )
}

export default TicketAssign
