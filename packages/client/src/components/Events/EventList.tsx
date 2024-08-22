import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { type SockbaseEventDocument } from 'sockbase'
import useEvent from '../../hooks/useEvent'
import useFirebase from '../../hooks/useFirebase'

const EventList: React.FC = () => {
  const { roles } = useFirebase()
  const { getEventsByOrganizationIdAsync } = useEvent()

  const [events, setEvents] = useState<Record<string, SockbaseEventDocument[]>>()

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!roles) return

      const orgIds = Object.keys(roles)
        .filter(id => id !== 'system')
        .filter(id => roles[id] >= 2)

      const fetchedEvents = await Promise.all(orgIds.map(async id => ({
        id,
        data: await getEventsByOrganizationIdAsync(id)
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
        {events && Object.entries(events).map(([id, evs]) => (
          <li key={id}>{id}
            <ul>
              {evs.map(e =>
                <li key={e.id}>
                  <Link to={`/dashboard/events/${e.id}`}>{e.name}</Link> @{e.venue.name}
                </li>)}
            </ul>
          </li>))}
      </ul>
    </>
  )
}

export default EventList
