import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { SockbaseAccount, SockbaseApplicationDocument, SockbaseEvent } from 'sockbase'

import useApplication from '../../../hooks/useApplication'
import useEvent from '../../../hooks/useEvent'

import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import ApplicationDetail from '../../../components/pages/dashboard/CircleApplications/ApplicationDetail'
import useUserData from '../../../hooks/useUserData'
import useFirebase from '../../../hooks/useFirebase'

const ApplicationDetailContainer: React.FC = () => {
  const { user } = useFirebase()
  const { getApplicationByHashedIdAsync } = useApplication()
  const { getEventByIdAsync } = useEvent()
  const { getUserDataByUserId } = useUserData()

  const { hashedAppId } = useParams()
  const [app, setApp] = useState<SockbaseApplicationDocument>()
  const [event, setEvent] = useState<SockbaseEvent>()
  const [userData, setUserData] = useState<SockbaseAccount>()

  const onInitialize: () => void =
    () => {
      const fetchApplicationAsync: () => Promise<void> =
        async () => {
          if (!hashedAppId || !user) return

          const fetchedApp = await getApplicationByHashedIdAsync(user.uid, hashedAppId)
          setApp(fetchedApp)

          const fetchedUser = await getUserDataByUserId(fetchedApp.userId)
          const fetchedEvent = await getEventByIdAsync(fetchedApp.eventId)
          setUserData(fetchedUser)
          setEvent(fetchedEvent)
        }
      fetchApplicationAsync()
        .catch(err => {
          throw err
        })
    }
  useEffect(onInitialize, [hashedAppId, user])

  const title = useMemo(() => {
    if (!event) return ''
    return `${event.eventName} 申し込み情報`
  }, [event])
  return (
    <DashboardLayout title={title}>
      {app && event && userData && <ApplicationDetail app={app} event={event} userData={userData} />}
    </DashboardLayout>
  )
}

export default ApplicationDetailContainer
