import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdAssignmentTurnedIn, MdDownload } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import { type SockbaseAccount, type SockbaseApplicationLinksDocument, type SockbaseApplicationMeta, type SockbaseApplicationOverviewDocument, type SockbaseApplicationDocument, type SockbaseEvent, type SockbaseSpaceDocument } from 'sockbase'
import FormButton from '../../components/Form/Button'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import useSpace from '../../hooks/useSpace'
import useUserData from '../../hooks/useUserData'

const DashboardEventSpacesPage: React.FC = () => {
  const { eventId } = useParams()
  const { getEventByIdAsync, getSpacesByEventIdAsync } = useEvent()
  const {
    getApplicationsByEventIdAsync,
    getApplicationMetaByIdAsync,
    getLinksByApplicationIdOptionalAsync,
    getOverviewByApplicationIdOptionalAsync
  } = useApplication()
  const { getUserDataByUserIdAndEventIdAsync } = useUserData()
  const { downloadSpaceDataXLSX } = useSpace()

  const [event, setEvent] = useState<SockbaseEvent>()
  const [spaces, setSpaces] = useState<SockbaseSpaceDocument[]>()
  const [apps, setApps] = useState<Record<string, SockbaseApplicationDocument>>()
  const [metas, setMetas] = useState<Record<string, SockbaseApplicationMeta>>()
  const [users, setUsers] = useState<Record<string, SockbaseAccount>>()
  const [links, setLinks] = useState<Record<string, SockbaseApplicationLinksDocument | null>>()
  const [overviews, setOverviews] = useState<Record<string, SockbaseApplicationOverviewDocument | null>>()

  const pageTitle = useMemo(() => {
    if (!event) return ''
    return `${event.eventName} 配置管理`
  }, [event])

  const handleDownload = useCallback(() => {
    if (!eventId || !event || !spaces || !apps || !metas || !users || !links || !overviews) return
    downloadSpaceDataXLSX(eventId, event, apps, metas, users, links, overviews)
  }, [eventId, event, spaces, apps, metas, users, links, overviews])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!eventId) return

      getEventByIdAsync(eventId)
        .then(fetchedEvent => setEvent(fetchedEvent))
        .catch(err => { throw err })

      getSpacesByEventIdAsync(eventId)
        .then(fetchedSpaces => setSpaces(fetchedSpaces))
        .catch(err => { throw err })

      const fetchedApps = await getApplicationsByEventIdAsync(eventId)
        .catch(err => { throw err })
      setApps(fetchedApps)

      const appIds = Object.keys(fetchedApps)
      const userIds = Object.values(fetchedApps)
        .map(a => a.userId)

      Promise.all(appIds.map(async id => ({
        id,
        data: await getApplicationMetaByIdAsync(id)
      })))
        .then(fetchedMetas => {
          const mappedMetas = fetchedMetas.reduce<Record<string, SockbaseApplicationMeta>>((p, c) => ({
            ...p,
            [c.id]: c.data
          }), {})
          setMetas(mappedMetas)
        })
        .catch(err => { throw err })

      Promise.all(userIds.map(async id => ({
        id,
        data: await getUserDataByUserIdAndEventIdAsync(id, eventId)
      })))
        .then(fetchedUserDatas => {
          const mappedUserDatas = fetchedUserDatas.reduce<Record<string, SockbaseAccount>>((p, c) => ({
            ...p,
            [c.id]: c.data
          }), {})
          setUsers(mappedUserDatas)
        })
        .catch(err => { throw err })

      Promise.all(appIds.map(async id => ({
        id,
        data: await getLinksByApplicationIdOptionalAsync(id)
      })))
        .then(fetchedLinks => {
          const mappedLinks = fetchedLinks.reduce<Record<string, SockbaseApplicationLinksDocument | null>>((p, c) => ({
            ...p,
            [c.id]: c.data
          }), {})
          setLinks(mappedLinks)
        })
        .catch(err => { throw err })

      Promise.all(appIds.map(async id => ({
        id,
        data: await getOverviewByApplicationIdOptionalAsync(id)
      })))
        .then(fetchedOverviews => {
          const mappedOverviews = fetchedOverviews.reduce<Record<string, SockbaseApplicationOverviewDocument | null>>((p, c) => ({
            ...p,
            [c.id]: c.data
          }), {})
          setOverviews(mappedOverviews)
        })
        .catch(err => { throw err })
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [eventId])

  return (
    <DashboardBaseLayout title={pageTitle} requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/events">管理イベント</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/dashboard/events/${eventId}`}>{event?.eventName ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        title={event?.eventName}
        description="配置管理"
        icon={<MdAssignmentTurnedIn />}
        isLoading={!event} />

      <FormSection>
        <FormItem inlined>
          <FormButton inlined color="default" onClick={handleDownload}>
            <IconLabel label="配置シートダウンロード" icon={<MdDownload />} />
          </FormButton>
        </FormItem>
      </FormSection>

      <TwoColumnsLayout>
        <></>
        <>
        </>
      </TwoColumnsLayout>

      {/* {eventId && event && spaces && apps && metas && users && links && overviews &&
        <EventSpacesStepContainer
          eventId={eventId}
          event={event}
          spaces={spaces}
          apps={apps}
          metas={metas}
          users={users}
          links={links}
          overviews={overviews} />} */}
    </DashboardBaseLayout>
  )
}

export default DashboardEventSpacesPage
