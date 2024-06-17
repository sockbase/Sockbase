import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Alert from '../../components/Parts/Alert'
import Loading from '../../components/Parts/Loading'
import useApplication from '../../hooks/useApplication'
import useEvent from '../../hooks/useEvent'
import useFirebase from '../../hooks/useFirebase'
import DefaultBaseLayout from '../../layouts/DefaultBaseLayout/DefaultBaseLayout'
import StepContainerComponent from './StepContainer/StepContainer'
import type {
  SockbaseApplicationLinksDocument,
  SockbaseApplicationDocument,
  SockbaseEvent,
  SockbaseEventDocument
} from 'sockbase'

const CircleApplicationPage: React.FC = () => {
  const params = useParams<{ eventId: string }>()
  const { getEventByIdAsync, getEventEyecatchAsync } = useEvent()
  const { getApplicationsByUserIdAsync, getLinksByApplicationIdOptionalAsync } = useApplication()
  const { isLoggedIn, user } = useFirebase()

  const [pageTitle, setPageTitle] = useState('')
  const [event, setEvent] = useState<SockbaseEvent | null>()
  const [eyecatchURL, setEyecatchURL] = useState<string | null>()

  const [pastApps, setPastApps] = useState<SockbaseApplicationDocument[]>()
  const [pastAppLinks, setPastAppLinks] = useState<Record<string, SockbaseApplicationLinksDocument | null>>()
  const [pastEvents, setPastEvents] = useState<Record<string, SockbaseEventDocument>>()

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!params.eventId) return
      const eventId = params.eventId

      const fetchedEvent = await getEventByIdAsync(eventId)
        .catch(() => {
          return null
        })
      setEvent(fetchedEvent)

      const fetchedEyecatchURL = await getEventEyecatchAsync(eventId)
      setEyecatchURL(fetchedEyecatchURL)

      if (fetchedEvent) {
        setPageTitle(`${fetchedEvent?.eventName} サークル参加申し込み受付`)
      }
    }

    fetchAsync()
      .catch(err => { throw err })
  }, [params.eventId])

  useEffect(() => {
    const handleBeforeUnloadEvent = (event: BeforeUnloadEvent): void => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnloadEvent)
    return () => window.removeEventListener('beforeunload', handleBeforeUnloadEvent)
  }, [])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!user) return
      const fetchedApplications = await getApplicationsByUserIdAsync(user.uid)
      const appIds = fetchedApplications.map(a => a.id)
      const eventIds = fetchedApplications.map(a => a.eventId)

      const fetchedLinks = await Promise.all(appIds.map(
        async id => ({
          id,
          data: await getLinksByApplicationIdOptionalAsync(id)
        })
      ))
        .then(fetchedLinks => fetchedLinks.reduce<Record<string, SockbaseApplicationLinksDocument | null>>((p, c) => ({
          ...p,
          [c.id]: c.data
        }), {}))
        .catch(err => { throw err })

      const fetchedEvents = await Promise.all(eventIds.map(
        async id => ({
          id,
          data: await getEventByIdAsync(id)
        })
      ))
        .then(fetchedEvents => fetchedEvents.reduce<Record<string, SockbaseEventDocument>>((p, c) => ({
          ...p,
          [c.id]: c.data
        }), {}))
        .catch(err => { throw err })

      setPastApps(fetchedApplications)
      setPastAppLinks(fetchedLinks)
      setPastEvents(fetchedEvents)
    }

    fetchAsync()
      .catch(err => { throw err })
  }, [user])

  return (
    <DefaultBaseLayout title={pageTitle}>
      {
        event === undefined
          ? <Loading text="イベント情報" />
          : event === null
            ? <Alert type="danger" title="イベントが見つかりません">
              指定されたIDのイベントを見つけることができませんでした。<br />
              URLが正しく入力されていることを確認してください。
            </Alert>
            : params.eventId && isLoggedIn !== undefined && user !== undefined && event && eyecatchURL !== undefined && <>
              {user?.email && <Alert>
                {user.email} としてログイン中です
              </Alert>}

              <StepContainerComponent
                eventId={params.eventId}
                event={event}
                isLoggedIn={isLoggedIn}
                eyecatchURL={eyecatchURL}
                pastApps={pastApps}
                pastAppLinks={pastAppLinks}
                pastEvents={pastEvents} />
            </>
      }
    </DefaultBaseLayout>
  )
}

export default CircleApplicationPage
