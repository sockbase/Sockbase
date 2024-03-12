import { useEffect, useState } from 'react'
import { type SockbaseEventDocument } from 'sockbase'
import { Link } from 'react-router-dom'
import useFirebase from '../../hooks/useFirebase'
import useEvent from '../../hooks/useEvent'

const EventList: React.FC = () => {
  const { roles } = useFirebase()
  const { getEventsByOrganizationId } = useEvent()

  const [events, setEvents] = useState<Record<string, SockbaseEventDocument[]>>()

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!roles) return

      const orgIds = Object.keys(roles)
        .filter(id => id !== 'system')
        .filter(id => roles[id] >= 2)

      const fetchedEvents = await Promise.all(orgIds.map(async id => ({
        id,
        data: await getEventsByOrganizationId(id)
      })))
        .then(e => e.reduce<Record<string, SockbaseEventDocument[]>>((p, c) => ({
          ...p,
          [c.id]: c.data
        }), {}))
        .catch(err => { throw err })
      setEvents(fetchedEvents)
    }

    fetchAsync()
      .catch(err => { throw err })
  }, [roles])

  return (
    <>
      <ul>
        {events && Object.entries(events).map(([id, ev]) => (
          <li key={id}>{id}
            <ul>
              {ev.map(e => <li key={e.id}><Link to={`/dashboard/events/${e.id}`}>{e.eventName}</Link></li>)}
            </ul>
          </li>))}
      </ul>
    </>
  )
}

export default EventList
