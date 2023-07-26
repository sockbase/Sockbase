import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DefaultLayout from '../../components/Layout/Default/Default'
import StepContainer from '../../components/pages/public/TicketAssign/StepContainer'
import Loading from '../../components/Parts/Loading'
import { type SockbaseStoreDocument, type SockbaseTicketUserDocument } from 'sockbase'
import useStore from '../../hooks/useStore'

const TicketAssign: React.FC = () => {
  const [searchParams] = useSearchParams({ thi: '' })

  const { } = useStore()

  const [ticketUser, setTicketUser] = useState<SockbaseTicketUserDocument>()
  const [store, setStore] = useState<SockbaseStoreDocument>()

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      const paramTicketHashId = searchParams.get('thi')
      if (!paramTicketHashId) return

      const fetchedTicketUser = 
    }

    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [searchParams])

  return (
    <DefaultLayout title="チケット受け取りページ">
      {tikcetHashId
        ? <StepContainer />
        : <Loading text="チケット情報" />}
    </DefaultLayout>
  )
}

export default TicketAssign
