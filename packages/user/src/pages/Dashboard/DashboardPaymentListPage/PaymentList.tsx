import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import PaymentStatusLabel from '../../../components/Parts/StatusLabel/PaymentStatusLabel'
import type {
  SockbaseApplicationDocument,
  SockbaseApplicationMeta,
  SockbaseEvent,
  SockbasePaymentDocument,
  SockbaseStoreDocument,
  SockbaseTicketDocument
} from 'sockbase'

interface Props {
  payments: SockbasePaymentDocument[]
  apps: Record<string, SockbaseApplicationDocument & { meta: SockbaseApplicationMeta } | null>
  events: Record<string, SockbaseEvent>
  tickets: Record<string, SockbaseTicketDocument | null>
  stores: Record<string, SockbaseStoreDocument>
  email: string
}
const PaymentList: React.FC<Props> = props => {
  const linkTargetId = useCallback((appId: string | null, ticketId: string | null): string => {
    if (appId) {
      const app = props.apps[appId]
      return `/dashboard/applications/${app?.hashId ?? ''}`
    }
    else if (ticketId) {
      const ticket = props.tickets[ticketId]
      return `/dashboard/tickets/${ticket?.hashId ?? ''}`
    }
    return ''
  }, [])

  const getTargetName = useCallback((payment: SockbasePaymentDocument): string => {
    if (payment.applicationId) {
      const app = props.apps[payment.applicationId]
      if (!app) return '(不明なイベント)'

      const event = props.events[app.eventId]
      return event.name
    }
    else if (payment.ticketId) {
      const ticket = props.tickets[payment.ticketId]
      if (!ticket) return '(不明なチケットストア)'

      const store = props.stores[ticket.storeId]
      const type = store.types
        .filter(t => t.id === ticket.typeId)[0]

      return `${store.name}(${type.name})`
    }

    return '-'
  }, [])

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>決済状態</th>
            <th>お支払い先 (補助番号)</th>
            <th>ご請求金額</th>
            <th>お支払い日時</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {props.payments.length !== 0
            ? props.payments
              .sort((a, b) => (b.createdAt?.getTime() ?? 9) - (a.createdAt?.getTime() ?? 0))
              .map(payment => (
                <tr key={payment.id}>
                  <td><PaymentStatusLabel payment={payment} /></td>
                  <td><Link to={linkTargetId(payment.applicationId, payment.ticketId)}>{getTargetName(payment)}</Link> ({payment.bankTransferCode})</td>
                  <td>{payment.paymentAmount.toLocaleString()}円</td>
                  <td>{payment.updatedAt?.toLocaleString() ?? '---'}</td>
                  <td>{payment.hashId ? <Link to={`/dashboard/payments/${payment.hashId}`}>お支払い詳細</Link> : '---'}</td>
                </tr>
              ))
            : <tr><th colSpan={7}>決済情報はありません</th></tr>}
        </tbody>
      </table>
    </>
  )
}

export default PaymentList
