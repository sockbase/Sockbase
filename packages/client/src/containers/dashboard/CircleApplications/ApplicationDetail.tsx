import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import type { SockbaseAccount, SockbaseApplicationDocument, SockbaseEvent } from 'sockbase'

import useApplication from '../../../hooks/useApplication'
import useEvent from '../../../hooks/useEvent'

import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import ApplicationDetail from '../../../components/pages/dashboard/CircleApplications/ApplicationDetail'
import useUserData from '../../../hooks/useUserData'

const ApplicationDetailContainer: React.FC = () => {
  const { getApplicationByHashedIdAsync } = useApplication()
  const { getEventByIdAsync } = useEvent()
  const { getUserDataByUserId } = useUserData()

  const { hashedAppId } = useParams()
  const [app, setApp] = useState<SockbaseApplicationDocument>()
  const [event, setEvent] = useState<SockbaseEvent>()
  const [user, setUser] = useState<SockbaseAccount>()

  const onInitialize: () => void =
    () => {
      const fetchApplicationAsync: () => Promise<void> =
        async () => {
          if (!hashedAppId) return

          const fetchedApp = await getApplicationByHashedIdAsync(hashedAppId)
          setApp(fetchedApp)

          const fetchedUser = await getUserDataByUserId(fetchedApp.userId)
          const fetchedEvent = await getEventByIdAsync(fetchedApp.eventId)
          setUser(fetchedUser)
          setEvent(fetchedEvent)
        }
      fetchApplicationAsync()
        .catch(err => {
          throw err
        })
    }
  useEffect(onInitialize, [hashedAppId])

  return (
    <DashboardLayout title="Hello Sockbase! 申し込み情報">
      {app && event && user && <ApplicationDetail app={app} event={event} user={user} />}
    </DashboardLayout>
  )
}

export default ApplicationDetailContainer
