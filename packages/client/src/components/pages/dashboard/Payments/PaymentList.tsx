import type {
  PaymentMethod,
  SockbaseApplicationDocument,
  SockbaseApplicationMeta,
  SockbaseEvent,
  SockbasePaymentDocument
} from 'sockbase'
import { Link } from 'react-router-dom'

import { MdPayments } from 'react-icons/md'

import PageTitle from '../../../Layout/Dashboard/PageTitle'
import Breadcrumbs from '../../../Parts/Breadcrumbs'
import PaymentStatusLabel from '../../../Parts/PaymentStatusLabel'

interface Props {
  payments: SockbasePaymentDocument[]
  apps: Record<string, SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>
  events: Record<string, SockbaseEvent>
}
const PaymentList: React.FC<Props> = (props) => {
  const linkTargetId: (appId: string | null, ticketId: string | null) => string =
    (appId, ticketId) => {
      if (appId) {
        const app = props.apps[appId]
        return `/dashboard/applications/${app.hashId ?? ''}`
      }
      else if (ticketId) {
        return `/dashboard/tickets/${ticketId}`
      }

      return ''
    }

  const eventName: (appId: string | null) => string =
    (appId) => {
      if (!appId) return ''

      const app = props.apps[appId]
      const event = props.events[app.eventId]
      return event.eventName ?? ''
    }

  const paymentMethod: (method: PaymentMethod) => string =
    (method) => {
      switch (method) {
        case 1:
          return 'オンライン決済'

        case 2:
          return '銀行振込'
      }
    }

  return (
    <>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdPayments />}
        title="決済履歴"
        description="Sockbaseでのお支払い状況の一覧を表示中" />

      <table>
        <thead>
          <tr>
            <th>お支払い先</th>
            <th>補助番号</th>
            <th>お支払い方法</th>
            <th>決済状態</th>
            <th>状態更新日時</th>
          </tr>
        </thead>
        <tbody>
          {props.payments.length !== 0
            ? props.payments
              .sort((a, b) => ((b.createdAt?.getTime()) ?? 9) - ((a.createdAt?.getTime()) ?? 0))
              .map(p => <tr key={p.id}>
                <th><Link to={linkTargetId(p.applicationId, p.ticketId)}>{eventName(p.applicationId)}</Link></th>
                <td>{p.bankTransferCode}</td>
                <td>{paymentMethod(p.paymentMethod)}</td>
                <td><PaymentStatusLabel status={p.status} /></td>
                <td>{p.updatedAt?.toLocaleString() ?? '-'}</td>
              </tr>)
            : <tr>
              <th>決済情報はありません</th>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          }
        </tbody>
      </table>
    </>
  )
}

export default PaymentList
