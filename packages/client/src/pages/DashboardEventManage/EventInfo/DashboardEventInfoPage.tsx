import { useEffect, useState } from 'react'
import { MdCalendarViewMonth } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormTextarea from '../../../components/Form/Textarea'
import DashboardBaseLayout from '../../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../components/Layout/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import BlinkField from '../../../components/Parts/BlinkField'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import useEvent from '../../../hooks/useEvent'
import type { SockbaseEvent } from 'sockbase'

const DashboardEventInfoPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const { getEventByIdAsync } = useEvent()

  const [event, setEvent] = useState<SockbaseEvent>()

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!eventId) return

      getEventByIdAsync(eventId)
        .then(fetchedEvent => setEvent(fetchedEvent))
        .catch(err => { throw err })
    }

    fetchAsync()
      .catch(err => { throw err })
  }, [eventId])

  return (
    <DashboardBaseLayout title="イベント メタ情報" requireCommonRole={2}>
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/events">管理イベント</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/dashboard/events/${eventId}`}>{event?.eventName ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        title={event?.eventName}
        description="イベントメタ情報"
        icon={<MdCalendarViewMonth />}
        isLoading={!event} />

      <TwoColumnsLayout>
        <>
          <h2>イベント情報</h2>

          <h3>基礎情報</h3>
          <table>
            <tbody>
              <tr>
                <th>イベントID</th>
                <td>{eventId}</td>
              </tr>
              <tr>
                <th>イベント名</th>
                <td>{event?.eventName ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>イベントWebサイト</th>
                <td>{event?.eventWebURL ?? <BlinkField />}</td>
              </tr>
            </tbody>
          </table>
        </>
        <>
          <h2>管理</h2>

          <h3>イベント設定データ</h3>
          <FormSection>
            <FormItem>
              <FormTextarea value={JSON.stringify(event)} disabled />
            </FormItem>
          </FormSection>
        </>
      </TwoColumnsLayout>
    </DashboardBaseLayout>
  )
}

export default DashboardEventInfoPage
