import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { type SockbaseStoreDocument, type SockbaseTicketUserDocument } from 'sockbase'
import Alert from '../../components/Parts/Alert'
import Loading from '../../components/Parts/Loading'
import useFirebase from '../../hooks/useFirebase'
import useStore from '../../hooks/useStore'
import TicketBaseLayout from '../../layouts/TicketBaseLayout/TicketBaseLayout'
import TicketView from './TicketView'

const TicketViewPage: React.FC = () => {
  const { ticketHashId } = useParams<{ ticketHashId: string }>()
  const { getTicketUserByHashIdOptionalAsync, getStoreByIdAsync } = useStore()
  const { user } = useFirebase()

  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument | null>()
  const [store, setStore] = useState<SockbaseStoreDocument>()

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!ticketHashId) return

      const fetchedTicketUser = await getTicketUserByHashIdOptionalAsync(ticketHashId)
      setTicketUser(fetchedTicketUser)
      if (!fetchedTicketUser) return

      getStoreByIdAsync(fetchedTicketUser.storeId)
        .then(fetchedStore => setStore(fetchedStore))
        .catch(err => { throw err })
    }

    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [ticketHashId])

  return (
    <TicketBaseLayout ticketUser={ticketUser} store={store}>
      {(!ticketUser || !store) &&
        <LoadingContainer>
          {ticketUser === undefined && <Loading text="チケット情報" />}
          {ticketUser === null &&
            <Alert type="error" title="チケットの取得に失敗しました">
              URL が間違っている可能性があります。
            </Alert>}
        </LoadingContainer>}
      {ticketHashId && ticketUser && store && user !== undefined &&
        <TicketView
          ticketHashId={ticketHashId}
          ticketUser={ticketUser}
          store={store}
          userId={user?.uid ?? null} />}
    </TicketBaseLayout >
  )
}

export default TicketViewPage

const LoadingContainer = styled.div`
  padding: 40px 25%;
  height: 100%;
  @media screen and (max-width: 840px) {
    padding: 20px;
  }
`
