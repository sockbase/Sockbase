import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { type SockbaseApplicationDocument, type SockbaseAccount, type SockbaseEventDocument, type SockbaseApplicationLinks } from 'sockbase'
import useApplication from '../../../hooks/useApplication'
import useEvent from '../../../hooks/useEvent'
import useFirebase from '../../../hooks/useFirebase'
import useUserData from '../../../hooks/useUserData'
import DefaultBaseLayout from '../../../layouts/DefaultBaseLayout/DefaultBaseLayout'
import StepContainer from './StepContainer/StepContainer'

const NewCircleApplyPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const {
    getEventByIdAsync,
    getEventEyecatchAsync
  } = useEvent()
  const {
    getApplicationsByUserIdAsync,
    getLinksByApplicationIdOptionalAsync
  } = useApplication()
  const { user } = useFirebase()
  const { getMyUserDataAsync } = useUserData()

  const [event, setEvent] = useState<SockbaseEventDocument | null>()
  const [eyecatchURL, setEyecatchURL] = useState<string | null>()

  const [userData, setUserData] = useState<SockbaseAccount | null>()
  const [pastApps, setPastApps] = useState<SockbaseApplicationDocument[]>()
  const [pastAppLinks, setPastAppLinks] = useState<Record<string, SockbaseApplicationLinks | null>>()
  const [pastEvents, setPastEvents] = useState<Record<string, SockbaseEventDocument>>()

  const pageTitle = useMemo(() => {
    if (!event) return
    return `${event.eventName} サークル申し込みページ`
  }, [event])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!eventId) return
      getEventByIdAsync(eventId)
        .then(fetchedEvent => setEvent(fetchedEvent))
        .catch(err => {
          setEvent(null)
          throw err
        })
      getEventEyecatchAsync(eventId)
        .then(fetchedEyecatchURL => setEyecatchURL(fetchedEyecatchURL))
        .catch(err => { throw err })
      getMyUserDataAsync()
        .then(fetchedUserData => setUserData(fetchedUserData))
        .catch(err => { throw err })

      if (user) {
        const fetchedPastApps = await getApplicationsByUserIdAsync(user.uid)
          .catch(err => { throw err })
        setPastApps(fetchedPastApps)

        const pastAppIds = fetchedPastApps.map(a => a.id)
        const eventIds = [...new Set(fetchedPastApps.map(a => a.eventId))]
        Promise.all(pastAppIds.map(async id => ({
          id,
          data: await getLinksByApplicationIdOptionalAsync(id)
        })))
          .then(fetchedAppLinks => fetchedAppLinks.reduce<Record<string, SockbaseApplicationLinks | null>>((p, c) => ({
            ...p,
            [c.id]: c.data
          }), {}))
          .then(mappedAppLinks => setPastAppLinks(mappedAppLinks))
          .catch(err => { throw err })
        Promise.all(eventIds.map(async id => ({
          id,
          data: await getEventByIdAsync(id)
        })))
          .then(fetchedEvents => fetchedEvents.reduce<Record<string, SockbaseEventDocument>>((p, c) => ({
            ...p,
            [c.id]: c.data
          }), {}))
          .then(mappedEvents => setPastEvents(mappedEvents))
          .catch(err => { throw err })
      }
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [user, eventId])

  return (
    <DefaultBaseLayout title={pageTitle}>
      <StepContainer
        event={event}
        user={user}
        eyecatchURL={eyecatchURL}
        userData={userData}
        pastApps={pastApps}
        pastAppLinks={pastAppLinks}
        pastEvents={pastEvents} />
    </DefaultBaseLayout>
  )
}

export default NewCircleApplyPage