import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { SockbaseAccount, SockbaseApplicationDocument, SockbaseApplicationMeta, SockbaseApplicationStatus, SockbaseEvent } from 'sockbase'

import useApplication from '../../../hooks/useApplication'
import useEvent from '../../../hooks/useEvent'

import DashboardLayout from '../../../components/Layout/Dashboard/Dashboard'
import ApplicationDetail from '../../../components/pages/dashboard/CircleApplications/ApplicationDetail'
import useUserData from '../../../hooks/useUserData'
import Loading from '../../../components/Parts/Loading'
import useRole from '../../../hooks/useRole'

const ApplicationDetailContainer: React.FC = () => {
  const {
    getApplicationIdByHashedIdAsync,
    getApplicationByIdAsync,
    getCircleCutURLByHashedIdAsync,
    updateApplicationStatusByIdAsync
  } = useApplication()
  const { getEventByIdAsync } = useEvent()
  const { getUserDataByUserIdAndEventIdAsync } = useUserData()
  const { checkIsAdminByOrganizationId } = useRole()

  const { hashedAppId } = useParams()
  const [app, setApp] = useState<SockbaseApplicationDocument & { meta: SockbaseApplicationMeta }>()
  const [appId, setAppId] = useState<string>()
  const [event, setEvent] = useState<SockbaseEvent>()
  const [userData, setUserData] = useState<SockbaseAccount>()
  const [circleCutURL, setCircleCutURL] = useState<string>()
  const [isAdmin, setAdmin] = useState<boolean | null>()

  const onInitialize: () => void =
    () => {
      const fetchApplicationAsync: () => Promise<void> =
        async () => {
          if (!hashedAppId) return

          const fetchedAppId = await getApplicationIdByHashedIdAsync(hashedAppId)
          setAppId(fetchedAppId)

          const fetchedApp = await getApplicationByIdAsync(fetchedAppId)
          setApp(fetchedApp)

          const fetchedCircleCutURL = await getCircleCutURLByHashedIdAsync(hashedAppId)
          setCircleCutURL(fetchedCircleCutURL)

          const fetchedUser = await getUserDataByUserIdAndEventIdAsync(fetchedApp.userId, fetchedApp.eventId)
          setUserData(fetchedUser)

          const fetchedEvent = await getEventByIdAsync(fetchedApp.eventId)
          setEvent(fetchedEvent)

          const fetchedIsAdmin = checkIsAdminByOrganizationId(fetchedEvent._organization.id)
          setAdmin(fetchedIsAdmin)
        }
      fetchApplicationAsync()
        .catch(err => {
          throw err
        })
    }
  useEffect(onInitialize, [hashedAppId, checkIsAdminByOrganizationId])

  const handleChangeStatus: (status: SockbaseApplicationStatus) => void =
    (status) => {
      if (!appId) return
      updateApplicationStatusByIdAsync(appId, status)
        .then(() => {
          alert('ステータスの変更に成功しました。')
          setApp(s => {
            if (!s) return
            return { ...s, meta: { ...s.meta, applicationStatus: status } }
          })
        })
        .catch(err => {
          throw err
        })
    }

  const title = useMemo(() => {
    if (!event) return '申し込み情報を読み込み中'
    return `${event.eventName} 申し込み情報`
  }, [event])

  return (
    <DashboardLayout title={title}>
      {app && event && userData && circleCutURL && isAdmin !== undefined
        ? <ApplicationDetail
          app={app}
          event={event}
          userData={userData}
          circleCutURL={circleCutURL}
          isAdmin={isAdmin}
          handleChangeStatus={handleChangeStatus} />
        : <Loading text={`申し込み情報 ${hashedAppId ?? ''}`} />}
    </DashboardLayout>
  )
}

export default ApplicationDetailContainer
