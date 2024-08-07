import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import PaymentStatusLabel from '../../../components/Parts/StatusLabel/PaymentStatusLabel'
import type {
  PaymentMethod,
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
const PaymentList: React.FC<Props> = (props) => {
  const linkTargetId = useCallback((appId: string | null, ticketId: string | null): string => {
    if (appId) {
      const app = props.apps[appId]
      return `/dashboard/applications/${app?.hashId ?? ''}`
    } else if (ticketId) {
      const ticket = props.tickets[ticketId]
      return `/dashboard/tickets/${ticket?.hashId ?? ''}`
    }
    return ''
  }, [])

  const paymentMethod = useCallback((method: PaymentMethod): string => {
    switch (method) {
      case 1:
        return 'オンライン決済'
      case 2:
        return '銀行振込'
    }
  }, [])

  const getTargetName = useCallback((payment: SockbasePaymentDocument): string => {
    if (payment.applicationId) {
      const app = props.apps[payment.applicationId]
      if (!app) return '(不明なイベント)'

      const event = props.events[app.eventId]
      return event.name
    } else if (payment.ticketId) {
      const ticket = props.tickets[payment.ticketId]
      if (!ticket) return '(不明なチケットストア)'

      const store = props.stores[ticket.storeId]
      const type = store.types
        .filter(t => t.id === ticket.typeId)[0]

      return `${store.name}(${type.name})`
    }

    return '-'
  }, [])

  const getPaymentLink = useCallback((payment: SockbasePaymentDocument): React.ReactNode => {
    if (payment.status !== 0 || payment.paymentMethod !== 1) return '-'

    const emailLink = `?prefilled_email=${encodeURIComponent(props.email)}`

    if (payment.applicationId) {
      const app = props.apps[payment.applicationId]
      if (!app) return '-'

      const space = props.events[app.eventId].spaces
        .filter(s => s.id === app.spaceId)[0]
      if (!space.productInfo) return '-'

      return <a href={`${space.productInfo.paymentURL}${emailLink}`} target="_blank" rel="noreferrer">お支払いはこちら</a>
    } else if (payment.ticketId) {
      const ticket = props.tickets[payment.ticketId]
      if (!ticket) return '-'

      const typeInfo = props.stores[ticket.storeId].types
        .filter(t => t.id === ticket.typeId)[0]
      if (!typeInfo.productInfo) return '-'

      return <a href={`${typeInfo.productInfo.paymentURL}${emailLink}`} target="_blank" rel="noreferrer">お支払いはこちら</a>
    }

    return '-'
  }, [])

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>お支払い先</th>
            <th>お支払い金額</th>
            <th>お支払い方法</th>
            <th>補助番号</th>
            <th>決済状態</th>
            <th>状態更新日時</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {props.payments.length !== 0
            ? props.payments
              .sort((a, b) => (b.createdAt?.getTime() ?? 9) - (a.createdAt?.getTime() ?? 0))
              .map(p => <tr key={p.id}>
                <th><Link to={linkTargetId(p.applicationId, p.ticketId)}>{getTargetName(p)}</Link></th>
                <td>{p.paymentAmount.toLocaleString()}円</td>
                <td>{paymentMethod(p.paymentMethod)}</td>
                <td>{p.bankTransferCode}</td>
                <td><PaymentStatusLabel payment={p} /></td>
                <td>{p.updatedAt?.toLocaleString() ?? '-'}</td>
                <td>{getPaymentLink(p)}</td>
              </tr>)
            : <tr><th colSpan={7}>決済情報はありません</th></tr>
          }
        </tbody>
      </table>
    </>
  )
}

export default PaymentList
