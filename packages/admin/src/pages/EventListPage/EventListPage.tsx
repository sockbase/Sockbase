import { useEffect, useState } from 'react'
import { MdAdd, MdEditCalendar } from 'react-icons/md'
import { Link } from 'react-router-dom'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import LinkButton from '../../components/Parts/LinkButton'
import PageTitle from '../../components/Parts/PageTitle'
import useEvent from '../../hooks/useEvent'
import useFirebase from '../../hooks/useFirebase'
import useRole from '../../hooks/useRole'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseEventDocument } from 'sockbase'

const EventListPage: React.FC = () => {
  const { roles } = useFirebase()
  const { isSystemAdmin } = useRole()
  const { getEventsByOrganizationIdAsync } = useEvent()

  const [events, setEvents] = useState<Record<string, SockbaseEventDocument[]>>()

  useEffect(() => {
    if (!roles) return

    const orgIds = Object.keys(roles)
      .filter(id => id !== 'system')
      .filter(id => roles[id] >= 2)

    Promise.all(orgIds.map(async id => ({
      id,
      data: await getEventsByOrganizationIdAsync(id)
    })))
      .then(e => e.reduce<Record<string, SockbaseEventDocument[]>>((p, c) => ({ ...p, [c.id]: c.data }), {}))
      .then(setEvents)
      .catch(err => { throw err })
  }, [roles])

  return (
    <DefaultLayout title='イベント管理' requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEditCalendar />}
        title="イベント管理" />

      {isSystemAdmin && <FormSection>
        <FormItem>
          <LinkButton to="/events/create" disabled>
            <IconLabel icon={<MdAdd />} label='イベント作成' />
          </LinkButton>
        </FormItem>
      </FormSection>}

      <ul>
        {events && Object.entries(events).map(([id, evs]) => (
          <li key={id}>{id}
            <ul>
              {evs.map(e =>
                <li key={e.id}>
                  <Link to={`/events/${e.id}`}>{e.name}</Link> @{e.venue.name}
                </li>)}
            </ul>
          </li>))}
      </ul>
    </DefaultLayout>
  )
}

export default EventListPage
