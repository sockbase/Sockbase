import { useEffect, useState } from 'react'
import type { SockbaseApplicationDocument, SockbaseEvent } from 'sockbase'

import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import ApplicationList from '../../../components/pages/dashboard/CircleApplications/ApplicationList'

import useFirebase from '../../../hooks/useFirebase'
import useApplication from '../../../hooks/useApplication'
import useEvent from '../../../hooks/useEvent'
import Loading from '../../../components/Parts/Loading'

const ApplicationListContainer: React.FC = () => {
  const { user } = useFirebase()
  const { getApplicationsByUserIdAsync } = useApplication()
  const { getEventByIdAsync } = useEvent()

  const [apps, setApps] = useState<SockbaseApplicationDocument[]>()
  const [events, setEvents] = useState<Record<string, SockbaseEvent>>()

  const onChangeLoggedInStatus: () => void =
    () => {
      const fetchAppsAsync: () => Promise<void> =
        async () => {
          if (!user) return
          const fetchedApps = await getApplicationsByUserIdAsync(user.uid)
          setApps(fetchedApps)

          const eventIdsSet = fetchedApps
            .map(app => app.eventId)
            .reduce((p, c) => {
              return p.add(c)
            }, new Set<string>())
          const eventIds = [...eventIdsSet]

          const fetchedEvents = await Promise.all(
            eventIds.map(async (eventId) => (
              {
                eventId,
                ...await getEventByIdAsync(eventId)
              }
            ))
          )
          const objectMappedEvents = fetchedEvents.reduce<Record<string, SockbaseEvent>>((p, c) => ({
            ...p,
            [c.eventId]: c
          }), {})
          setEvents(objectMappedEvents)
        }
      fetchAppsAsync()
        .catch(err => {
          throw err
        })
    }
  useEffect(onChangeLoggedInStatus, [user])

  return (
    <DashboardLayout title="申し込んだイベント">
      {apps && events
        ? <ApplicationList apps={apps} events={events} />
        : <Loading text="申し込み履歴" />}
    </DashboardLayout>
  )
}

export default ApplicationListContainer
