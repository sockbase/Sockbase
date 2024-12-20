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
  const { getTicketUserByHashIdNullableAsync, getStoreByIdAsync } = useStore()
  const { user } = useFirebase()

  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument | null>()
  const [store, setStore] = useState<SockbaseStoreDocument>()

  useEffect(() => {
    if (!ticketHashId) return
    getTicketUserByHashIdNullableAsync(ticketHashId)
      .then(setTicketUser)
      .catch(err => { throw err })
  }, [ticketHashId])

  useEffect(() => {
    if (!ticketUser) return
    getStoreByIdAsync(ticketUser.storeId)
      .then(setStore)
      .catch(err => { throw err })
  }, [ticketUser])

  return (
    <TicketBaseLayout
      store={store}
      ticketUser={ticketUser}>
      {(!ticketUser || !store) && (
        <LoadingContainer>
          {ticketUser === undefined && <Loading text="チケット情報" />}
          {ticketUser === null && (
            <Alert
              title="チケットの取得に失敗しました"
              type="error">
              URL が間違っている可能性があります。
            </Alert>
          )}
        </LoadingContainer>
      )}
      {ticketHashId && ticketUser && store && user?.uid && (
        <TicketView
          store={store}
          ticketHashId={ticketHashId}
          ticketUser={ticketUser}
          userId={user.uid} />
      )}
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
