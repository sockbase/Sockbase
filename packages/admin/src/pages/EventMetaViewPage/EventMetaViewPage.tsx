import { useState, useEffect } from 'react'
import { MdGridView } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormInput from '../../components/Form/FormInput'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import CopyToClipboard from '../../components/Parts/CopyToClipboard'
import EventInfo from '../../components/Parts/EventInfo'
import PageTitle from '../../components/Parts/PageTitle'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import envHelper from '../../helpers/envHelper'
import useEvent from '../../hooks/useEvent'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseEvent } from 'sockbase'

const EventMetaViewPage: React.FC = () => {
  const { eventId } = useParams()
  const { getEventByIdAsync } = useEvent()

  const [event, setEvent] = useState<SockbaseEvent>()

  useEffect(() => {
    if (!eventId) return
    getEventByIdAsync(eventId)
      .then(setEvent)
      .catch(err => { throw err })
  }, [eventId])

  return (
    <DefaultLayout
      requireCommonRole={2}
      title="イベントメタ情報">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/events">イベント一覧</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/events/${eventId}`}>{event?.name ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdGridView />}
        title="イベントメタ情報" />

      <TwoColumnLayout>
        <>
          <h2>イベント情報</h2>

          <EventInfo
            event={event}
            eventId={eventId}
            eyecatchData={null} />
        </>
        <>
          <h2>管理</h2>
          <p>
            設定データをコピー <CopyToClipboard content={JSON.stringify(event)} />
          </p>

          <h2>申し込みタグ</h2>
          <FormSection>
            <FormItem>
              <FormInput
                readOnly
                value={`<a class="sb_button" href="${envHelper.userAppURL}/events/${eventId}" rel="noreferrer" target="_blank">Sockbaseで申し込む</a><script src="${envHelper.userAppURL}/shared/sb-button.js"></script>`} />
            </FormItem>
          </FormSection>
        </>
      </TwoColumnLayout>
    </DefaultLayout>
  )
}

export default EventMetaViewPage
