import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { type SockbaseEvent } from 'sockbase'

import useEvent from '../../hooks/useEvent'
import useFirebase from '../../hooks/useFirebase'

import DefaultLayout from '../../components/Layout/Default/Default'
import StepContainerComponent from '../../components/pages/events/Application/StepContainer'
import Alert from '../../components/Parts/Alert'
import Loading from '../../components/Parts/Loading'

const TicketApplication: React.FC = () => {
  const params = useParams<{ storeId: string }>()
  const { getEventByIdAsync } = useEvent()
  const { isLoggedIn, user } = useFirebase()

  const [pageTitle, setPageTitle] = useState('')
  const [event, setEvent] = useState<SockbaseEvent | null | undefined>()
  const onChangeEventId: () => void = () => {
    if (!params.storeId) return
    const storeId = params.storeId

    const f: () => Promise<void> = async () => {
      const fetchedEvent = await getEventByIdAsync(storeId)
        .catch(() => {
          return null
        })
      setEvent(fetchedEvent)

      if (fetchedEvent) {
        setPageTitle(`${fetchedEvent?.eventName} サークル参加申し込み受付`)
      }
    }
    f().catch(err => {
      throw err
    })
  }
  useEffect(onChangeEventId, [params.storeId])

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
            : params.storeId && isLoggedIn !== undefined && user !== undefined && event && <>
              {user?.email && <Alert>
                {user.email} としてログイン中です
              </Alert>}
              <StepContainerComponent eventId={params.storeId} event={event} isLoggedIn={isLoggedIn} />
            </>
      }
    </DefaultLayout>
  )
}

export default TicketApplication
