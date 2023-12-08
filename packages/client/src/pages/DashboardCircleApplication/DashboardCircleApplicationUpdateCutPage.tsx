import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MdPhoto } from 'react-icons/md'
import {
  type SockbaseApplicationDocument,
  type SockbaseEvent
} from 'sockbase'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import useRole from '../../hooks/useRole'
// import useDayjs from '../../hooks/useDayjs'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import BlinkField from '../../components/Parts/BlinkField'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'

const DashboardCircleApplicationUpdateCutPage: React.FC = () => {
  const { hashedAppId } = useParams<{ hashedAppId: string }>()
  const {
    getApplicationIdByHashedIdAsync,
    getApplicationByIdAsync
  } = useApplication()
  const { getEventByIdAsync } = useEvent()
  const { checkIsAdminByOrganizationId } = useRole()
  // const { formatByDate } = useDayjs()

  // const [appId, setAppId] = useState<string>()
  const [app, setApp] = useState<SockbaseApplicationDocument>()
  const [eventId, setEventId] = useState<string>()
  const [event, setEvent] = useState<SockbaseEvent>()
  const [isAdmin, setAdmin] = useState<boolean | null>()

  const onInitialize = (): void => {
    const fetchAsync = async (): Promise<void> => {
      if (!hashedAppId) return

      const fetchedAppId = await getApplicationIdByHashedIdAsync(hashedAppId)
      const fetchedApp = await getApplicationByIdAsync(fetchedAppId.applicationId)
      const fetchedEvent = await getEventByIdAsync(fetchedApp.eventId)
      const fetchedIsAdmin = checkIsAdminByOrganizationId(fetchedEvent._organization.id)

      // setAppId(fetchedAppId.applicationId)
      setApp(fetchedApp)
      setEventId(fetchedApp.eventId)
      setEvent(fetchedEvent)
      setAdmin(fetchedIsAdmin)
    }
    fetchAsync()
      .catch(err => { throw err })
  }
  useEffect(onInitialize, [hashedAppId])

  return (
    <DashboardBaseLayout title="サークルカット変更" requireSystemRole={0}>
    <Breadcrumbs>
      <li><Link to="/dashboard">マイページ</Link></li>
      {isAdmin
        ? <>
          <li><Link to="/dashboard/events">管理イベント</Link></li>
          <li>{event?._organization.name ?? <BlinkField />}</li>
          <li><Link to={`/dashboard/events/${eventId}`}>{event?.eventName}</Link></li>
        </>
        : <>
          <li><Link to="/dashboard/applications">サークル申し込み履歴</Link></li>
          <li>{event?.eventName ?? <BlinkField />}</li>
        </>}
      <li>
        {(hashedAppId && app && <Link to={`/dashboard/applications/${hashedAppId}`}>{app.circle.name}</Link>) ?? <BlinkField />}
      </li>
    </Breadcrumbs>
    <PageTitle title={app?.circle.name} description="サークルカット変更" icon={<MdPhoto />} isLoading={!app} />

    現在準備中です。

    </DashboardBaseLayout>
  )
}

export default DashboardCircleApplicationUpdateCutPage
