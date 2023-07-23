import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { SockbaseApplicationDocument, SockbaseApplicationMeta, SockbaseEvent, SockbasePaymentDocument } from 'sockbase'
import { MdPayments } from 'react-icons/md'
import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import PaymentList from '../../../components/pages/dashboard/Payments/PaymentList'
import useFirebase from '../../../hooks/useFirebase'
import usePayment from '../../../hooks/usePayment'
import useApplication from '../../../hooks/useApplication'
import useEvent from '../../../hooks/useEvent'
import Loading from '../../../components/Parts/Loading'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import PageTitle from '../../../components/Layout/Dashboard/PageTitle'

const DashboardPaymentList: React.FC = () => {
  const { user } = useFirebase()
  const { getPaymentsByUserId } = usePayment()
  const { getApplicationByIdAsync } = useApplication()
  const { getEventByIdAsync } = useEvent()

  const [payments, setPayments] = useState<SockbasePaymentDocument[]>()
  const [apps, setApps] = useState<Record<string, SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>>()
  const [events, setEvents] = useState<Record<string, SockbaseEvent>>()

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
          const appIds = [...appIdsSet]

          const fetchedApps = await Promise.all(
            appIds.map(async (appId) => ({ appId, data: await getApplicationByIdAsync(appId) }))
          )
          const objectMappedApps = fetchedApps
            .reduce<Record<string, SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>>(
              (p, c) => ({ ...p, [c.appId]: c.data }),
              {})
          const eventIdsSet = Object.values(objectMappedApps)
            .reduce((p, c) => p.add(c.eventId), new Set<string>())
          const eventIds = [...eventIdsSet]

          const fetchedEvents = await Promise.all(
            eventIds.map(async (eventId) => ({ eventId, data: await getEventByIdAsync(eventId) }))
          )
          const objectMappedEvents = fetchedEvents
            .reduce<Record<string, SockbaseEvent>>(
              (p, c) => ({ ...p, [c.eventId]: c.data }),
              {})

          setPayments(fetchedPayments)
          setApps(objectMappedApps)
          setEvents(objectMappedEvents)
        }

      fetchPaymentAsync()
        .catch(err => { throw err })
    }
  useEffect(onInitialize, [user])

  return (
    <DashboardLayout title="決済一覧">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdPayments />}
        title="決済履歴"
        description="Sockbaseでのお支払い状況の一覧を表示中" />

      {payments && apps && events && user?.email
        ? <PaymentList
          payments={payments}
          apps={apps}
          events={events}
          email={user.email} />
        : <Loading text="決済一覧" />}
    </DashboardLayout>
  )
}

export default DashboardPaymentList
