import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import useApplication from '../../../hooks/useApplication'
import useEvent from '../../../hooks/useEvent'
import useFirebase from '../../../hooks/useFirebase'
import useUserData from '../../../hooks/useUserData'
import DefaultBaseLayout from '../../../layouts/DefaultBaseLayout/DefaultBaseLayout'
import StepContainer from './StepContainer/StepContainer'
import type {
  SockbaseApplicationDocument,
  SockbaseAccount,
  SockbaseEventDocument,
  SockbaseApplicationLinks
} from 'sockbase'

const NewCircleApplyPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const {
    getEventByIdAsync,
    getEventEyecatchAsync
  } = useEvent()
  const {
    getApplicationsByUserIdAsync,
    getLinksByApplicationIdOptionalAsync,
    submitApplicationAsync,
    uploadCircleCutFileAsync
  } = useApplication()
  const {
    user,
    createUserAsync,
    loginByEmailAsync,
    logoutAsync
  } = useFirebase()
  const { getMyUserDataAsync, updateUserDataAsync } = useUserData()

  const [event, setEvent] = useState<SockbaseEventDocument | null>()
  const [eyecatchURL, setEyecatchURL] = useState<string | null>()

  const [userData, setUserData] = useState<SockbaseAccount | null>()
  const [pastApps, setPastApps] = useState<SockbaseApplicationDocument[] | null>()
  const [pastAppLinks, setPastAppLinks] = useState<Record<string, SockbaseApplicationLinks | null> | null>()
  const [pastEvents, setPastEvents] = useState<Record<string, SockbaseEventDocument> | null>()

  const pageTitle = useMemo(() => {
    if (!event) return
    return `${event.eventName} サークル申し込みページ`
  }, [event])

  const handleLoginAsync = useCallback(async (email: string, password: string) => {
    await loginByEmailAsync(email, password)
      .catch(err => { throw err })
  }, [])

  const handleLogoutAsync = useCallback(async () => {
    logoutAsync()
      .catch(err => { throw err })
    setPastApps(null)
    setPastAppLinks(null)
    setPastEvents(null)
  }, [])

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

  useEffect(() => {
    const handleBeforeUnloadEvent = (event: BeforeUnloadEvent): void => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnloadEvent)
    return () => window.removeEventListener('beforeunload', handleBeforeUnloadEvent)
  }, [])

  return (
    <DefaultBaseLayout title={pageTitle}>
      <StepContainer
        event={event}
        user={user}
        eyecatchURL={eyecatchURL}
        userData={userData}
        pastApps={pastApps}
        pastAppLinks={pastAppLinks}
        pastEvents={pastEvents}
        loginAsync={handleLoginAsync}
        logoutAsync={handleLogoutAsync}
        createUserAsync={createUserAsync}
        updateUserDataAsync={updateUserDataAsync}
        submitApplicationAsync={submitApplicationAsync}
        updateCircleCutFileAsync={uploadCircleCutFileAsync} />
    </DefaultBaseLayout>
  )
}

export default NewCircleApplyPage
