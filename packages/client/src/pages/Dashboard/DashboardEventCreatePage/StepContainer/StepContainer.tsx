import { useCallback, useEffect, useState } from 'react'
import useEvent from '../../../../hooks/useEvent'
import Complete from './Complete'
import InformationConfirm from './InformationConfirm'
import InformationImport from './InformationInput'
import type { SockbaseEvent } from 'sockbase'

const StepContainer: React.FC = () => {
  const { createEventAsync, uploadEventEyecatchAsync } = useEvent()

  const [stepComponents, setStepComponents] = useState<JSX.Element[]>()
  const [step, setStep] = useState(0)

  const [eventId, setEventId] = useState<string | null>()
  const [event, setEvent] = useState<SockbaseEvent | null>()
  const [eyecatchFile, setEyecatchFile] = useState<File | null>()
  const [eyecatchData, setEyecatchData] = useState<string | null>()

  const handleCreateAsync = useCallback(async (): Promise<void> => {
    console.log(event)

    if (!eventId || !event) {
      throw new Error('event data is empty')
    }
    await createEventAsync(eventId, event)
      .catch(err => { throw err })

    if (!eyecatchFile) return
    await uploadEventEyecatchAsync(eventId, eyecatchFile)
      .catch(err => { throw err })
  }, [eventId, event, eyecatchFile])

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
      <Complete
        key="complete"
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

export default StepContainer
