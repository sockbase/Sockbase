import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconMReceipt } from 'react-fluentui-emoji/lib/modern'
import type {
  SockbaseApplicationDocument,
  SockbaseApplicationMeta,
  SockbaseEvent,
  SockbasePaymentDocument,
  SockbaseStoreDocument,
  SockbaseTicketDocument
} from 'sockbase'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PaymentList from './PaymentList'
import useFirebase from '../../hooks/useFirebase'
import usePayment from '../../hooks/usePayment'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import Loading from '../../components/Parts/Loading'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import useStore from '../../hooks/useStore'

const DashboardPaymentListPage: React.FC = () => {
  const { user } = useFirebase()
  const { getPaymentsByUserId } = usePayment()
  const { getApplicationByIdAsync } = useApplication()
  const { getEventByIdAsync } = useEvent()
  const { getTicketByIdAsync, getStoreByIdAsync } = useStore()

  const [payments, setPayments] = useState<SockbasePaymentDocument[]>()
  const [apps, setApps] = useState<Record<string, SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>>()
  const [events, setEvents] = useState<Record<string, SockbaseEvent>>()
  const [tickets, setTickets] = useState<Record<string, SockbaseTicketDocument>>()
  const [stores, setStores] = useState<Record<string, SockbaseStoreDocument>>()

  const onInitialize: () => void =
    () => {
      if (!user) return
      const fetchPaymentAsync: () => Promise<void> =
        async () => {
          const fetchedPayments = await getPaymentsByUserId(user.uid)

          const appIdsSet = fetchedPayments
            .reduce((p, c) => {
              if (!c.applicationId) return p
              return p.add(c.applicationId)
            }, new Set<string>())
          const ticketIdsSet = fetchedPayments
            .reduce((p, c) => {
              if (!c.ticketId) return p
              return p.add(c.ticketId)
            }, new Set<string>())

          const appIds = [...appIdsSet]
          const ticketIds = [...ticketIdsSet]

          const fetchedApps = await Promise.all(
            appIds.map(async (appId) => ({ appId, data: await getApplicationByIdAsync(appId) }))
          )
          const fetchedTickets = await Promise.all(
            ticketIds.map(async (ticketId) => ({ ticketId, data: await getTicketByIdAsync(ticketId) }))
          )

          const objectMappedApps = fetchedApps
            .reduce<Record<string, SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>>(
            (p, c) => ({ ...p, [c.appId]: c.data }),
            {})
          const objectMappedTickets = fetchedTickets
            .reduce<Record<string, SockbaseTicketDocument>>(
            (p, c) => ({ ...p, [c.ticketId]: c.data }),
            {}
          )

          const eventIdsSet = Object.values(objectMappedApps)
            .reduce((p, c) => p.add(c.eventId), new Set<string>())
          const eventIds = [...eventIdsSet]

          const storeIdsSet = Object.values(objectMappedTickets)
            .reduce((p, c) => p.add(c.storeId), new Set<string>())
          const storeIds = [...storeIdsSet]

          const fetchedEvents = await Promise.all(
            eventIds.map(async (eventId) => ({ eventId, data: await getEventByIdAsync(eventId) }))
          )
          const fetchedStores = await Promise.all(
            storeIds.map(async (storeId) => ({ storeId, data: await getStoreByIdAsync(storeId) }))
          )

          const objectMappedEvents = fetchedEvents
            .reduce<Record<string, SockbaseEvent>>(
            (p, c) => ({ ...p, [c.eventId]: c.data }),
            {})
          const objectMappedStores = fetchedStores
            .reduce<Record<string, SockbaseStoreDocument>>(
            (p, c) => ({ ...p, [c.storeId]: c.data }),
            {})

          setPayments(fetchedPayments)
          setApps(objectMappedApps)
          setTickets(objectMappedTickets)
          setEvents(objectMappedEvents)
          setStores(objectMappedStores)
        }

      fetchPaymentAsync()
        .catch(err => { throw err })
    }
  useEffect(onInitialize, [user])

  return (
    <DashboardBaseLayout title="決済一覧">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<IconMReceipt />}
        title="決済履歴"
        description="Sockbaseでのお支払い状況の一覧を表示中" />

      {payments && apps && events && tickets && stores && user?.email
        ? <PaymentList
          payments={payments}
          apps={apps}
          events={events}
          tickets={tickets}
          stores={stores}
          email={user.email} />
        : <Loading text="決済一覧" />}
    </DashboardBaseLayout>
  )
}

export default DashboardPaymentListPage
