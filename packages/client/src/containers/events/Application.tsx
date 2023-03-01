import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { type SockbaseEvent } from 'sockbase'

import useEvent from '../../hooks/useEvent'

import DefaultLayout from '../../components/Layout/Default/Default'
import StepContainerComponent from '../../components/pages/events/Application/StepContainer'
import Alert from '../../components/Parts/Alert'
import Loading from '../../components/Parts/Loading'

const EventApplication: React.FC = () => {
  const params = useParams<{ eventId: string }>()
  const { getEventByIdAsync } = useEvent()

  const [pageTitle, setPageTitle] = useState('')
  const [event, setEvent] = useState<SockbaseEvent | null | undefined>()
  const onChangeEventId: () => void = () => {
    if (!params.eventId) return
    const eventId = params.eventId

    const f: () => Promise<void> = async () => {
      const fetchedEvent = await getEventByIdAsync(eventId)
        .catch(() => {
          return null
        })
      setEvent(fetchedEvent)

      if (fetchedEvent) {
        setPageTitle(`${fetchedEvent?.eventName} サークル参加申込み受付`)
      }
    }
    f().catch(err => {
      throw err
    })
  }
  useEffect(onChangeEventId, [params.eventId])

  return (
    <DefaultLayout title={pageTitle}>
      {
        event === undefined
          ? <Loading text="イベント情報" />
          : event === null
            ? <Alert type="danger" title="イベントが見つかりません">
              指定されたIDのイベントを見つけることができませんでした。<br />
              URLが正しく入力されていることを確認してください。
            </Alert>
            : event && <StepContainerComponent event={event} />
      }
    </DefaultLayout>
  )
}

export default EventApplication
