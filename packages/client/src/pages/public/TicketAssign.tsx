import { useSearchParams } from 'react-router-dom'
import DefaultLayout from '../../components/Layout/Default/Default'
import Loading from '../../components/Parts/Loading'

const TicketAssign: React.FC = () => {
  const [searchParams] = useSearchParams({ thi: '' })

  return (
    <DefaultLayout title="チケット受け取りページ">
      <Loading text="チケット情報" />
      <h1>チケット受け取りページ</h1>
      {searchParams.get('thi')}
    </DefaultLayout>
  )
}

export default TicketAssign
