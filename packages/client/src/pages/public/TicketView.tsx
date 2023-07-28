import styled from 'styled-components'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { type SockbaseStoreDocument, type SockbaseTicketUserDocument } from 'sockbase'
import TicketViewPanel from '../../components/pages/public/TicketView/TicketViewPanel'
import useStore from '../../hooks/useStore'
import Loading from '../../components/Parts/Loading'
import TicketLayout from '../../components/Layout/Ticket/Ticket'

const TicketView: React.FC = () => {
  const { ticketHashId } = useParams<{ ticketHashId: string }>()
  const { getTicketUserByHashIdOptionalAsync, getStoreByIdAsync } = useStore()

  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument | null>()
  const [store, setStore] = useState<SockbaseStoreDocument>()

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!ticketHashId) return

      const ticketUser = await getTicketUserByHashIdOptionalAsync(ticketHashId)
      setTicketUser(ticketUser)
      if (!ticketUser) return

      getStoreByIdAsync(ticketUser.storeId)
        .then(fetchedStore => setStore(fetchedStore))
        .catch(err => { throw err })
    }

    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [ticketHashId])

  return (
    <TicketLayout ticketUser={ticketUser} store={store}>
      {(!ticketUser || !store) && <LoadingWrapper>
        <Loading text="チケット情報" />
      </LoadingWrapper>}
      {ticketUser && store && <TicketViewPanel ticketUser={ticketUser} store={store} />}
    </TicketLayout>
  )
}

export default TicketView

const LoadingWrapper = styled.div`
  padding: 10px;
`
