import { useParams } from 'react-router-dom'

const TicketView: React.FC = () => {
  const { ticketHashId } = useParams<{ ticketHashId: string }>()
  return (
    <>
      TicketView {ticketHashId}
    </>
  )
}

export default TicketView
