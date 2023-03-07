import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { SockbaseAccount, SockbaseApplicationDocument, SockbaseEvent } from 'sockbase'

import useApplication from '../../../hooks/useApplication'
import useEvent from '../../../hooks/useEvent'

import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import ApplicationDetail from '../../../components/pages/dashboard/CircleApplications/ApplicationDetail'
import useUserData from '../../../hooks/useUserData'
import Loading from '../../../components/Parts/Loading'

const ApplicationDetailContainer: React.FC = () => {
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
          if (!hashedAppId) return

          const fetchedApp = await getApplicationByHashedIdAsync(hashedAppId)
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
  useEffect(onInitialize, [hashedAppId])

  const title = useMemo(() => {
    if (!event) return '申し込み情報を読み込み中'
    return `${event.eventName} 申し込み情報`
  }, [event])

  return (
    <DashboardLayout title={title}>
      {app && event && userData
        ? <ApplicationDetail app={app} event={event} userData={userData} />
        : <Loading text={`申し込み情報 ${hashedAppId ?? ''}`} />}
    </DashboardLayout>
  )
}

export default ApplicationDetailContainer
