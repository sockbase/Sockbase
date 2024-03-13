import { useCallback, useEffect, useState } from 'react'
import useEvent from '../../../../hooks/useEvent'
import CompleteCreate from './CompleteCreate'
import InformationConfirm from './InformationConfirm'
import InformationImport from './InformationInput'
import type { SockbaseEvent } from 'sockbase'

const EventCreateStepContainer: React.FC = () => {
  const { createEventAsync } = useEvent()

  const [stepComponents, setStepComponents] = useState<JSX.Element[]>()
  const [step, setStep] = useState(0)
  const [eventId, setEventId] = useState<string | null>()
  const [event, setEvent] = useState<SockbaseEvent | null>()
  const [eyecatchFile, setEyecatchFile] = useState<File | null>()
  const [eyecatchData, setEyecatchData] = useState<string | null>()

  const handleCreateAsync = useCallback(async (): Promise<void> => {
    if (!eventId || !event) {
      throw new Error('eventId or event is undefined')
    }
    await createEventAsync(eventId, event)
      .then(() => alert('作成しました'))
      .catch(err => { throw err })
  }, [eventId, event])

  const handleInitialize = useCallback(() => {
    setStep(0)
    setEventId(null)
    setEvent(null)
    setEyecatchFile(null)
    setEyecatchData(null)
  }, [])

  useEffect(() => window.scrollTo(0, 0), [step])

  useEffect(() => {
    setStepComponents([
      <InformationImport
        key="information-import"
        eventId={eventId}
        event={event}
        eyecatchFile={eyecatchFile}
        nextStep={(eventId: string, event: SockbaseEvent, eyecatchFile: File | undefined, eyecatchData: string | undefined) => {
          setEventId(eventId)
          setEvent(event)
          setEyecatchFile(eyecatchFile)
          setEyecatchData(eyecatchData)
          setStep(1)
        }} />,
      <InformationConfirm
        key="information-confirm"
        eventId={eventId}
        event={event}
        eyecatchData={eyecatchData}
        prevStep={() => setStep(0)}
        nextStep={() => setStep(2)}
        handleCreateAsync={handleCreateAsync} />,
      <CompleteCreate
        key="complete-create"
        eventId={eventId}
        init={handleInitialize} />
    ])
  }, [eventId, event, eyecatchFile, eyecatchData, handleCreateAsync])

  return (
    <>
      {stepComponents?.[step]}
    </>
  )
}

export default EventCreateStepContainer
