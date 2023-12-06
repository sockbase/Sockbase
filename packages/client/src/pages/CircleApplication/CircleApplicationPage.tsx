import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { type SockbaseEvent } from 'sockbase'
import useEvent from '../../hooks/useEvent'
import useFirebase from '../../hooks/useFirebase'
import DefaultBaseLayout from '../../components/Layout/DefaultBaseLayout/DefaultBaseLayout'
import StepContainerComponent from './StepContainer/StepContainer'
import Alert from '../../components/Parts/Alert'
import Loading from '../../components/Parts/Loading'

const CircleApplicationPage: React.FC = () => {
  const params = useParams<{ eventId: string }>()
  const { getEventByIdAsync, getEventEyecatch } = useEvent()
  const { isLoggedIn, user } = useFirebase()

  const [pageTitle, setPageTitle] = useState('')
  const [event, setEvent] = useState<SockbaseEvent | null>()
  const [eyecatchURL, setEyecatchURL] = useState<string | null>()

  const onChangeEventId: () => void = () => {
    if (!params.eventId) return
    const eventId = params.eventId

    const f: () => Promise<void> = async () => {
      const fetchedEvent = await getEventByIdAsync(eventId)
        .catch(() => {
          return null
        })
      setEvent(fetchedEvent)

      const fetchedEyecatchURL = await getEventEyecatch(eventId)
      setEyecatchURL(fetchedEyecatchURL)

      if (fetchedEvent) {
        setPageTitle(`${fetchedEvent?.eventName} サークル参加申し込み受付`)
      }
    }
    f().catch(err => {
      throw err
    })
  }
  useEffect(onChangeEventId, [params.eventId])

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
              <StepContainerComponent eventId={params.eventId} event={event} isLoggedIn={isLoggedIn} eyecatchURL={eyecatchURL} />
            </>
      }
    </DefaultBaseLayout>
  )
}

export default CircleApplicationPage
