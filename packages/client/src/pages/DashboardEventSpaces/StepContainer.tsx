import { useEffect, useState } from 'react'
import useEvent from '../../hooks/useEvent'
import SpaceAssign from './SpaceAssign'
import SpaceAssignConfirm from './SpaceAssignConfirm'
import SpaceCreate from './SpaceCreate'
import SpaceCreateConfirm from './SpaceCreateConfirm'
import SpaceView from './SpaceView'
import type { RawAssignEventSpace, RawEventSpace } from '../../@types'
import type { SockbaseApplicationDocument, SockbaseSpaceDocument } from 'sockbase'

interface Props {
  eventId: string
  spaces: SockbaseSpaceDocument[]
  apps: Record<string, SockbaseApplicationDocument>
}
const StepContainer: React.FC<Props> = (props) => {
  const { createSpacesAsync, assignSpacesAsync } = useEvent()

  const [step, setStep] = useState(0)
  const [stepComponents, setStepComponents] = useState<React.ReactNode[]>([])

  const [rawSpaces, setRawSpaces] = useState<RawEventSpace[]>([])
  const [spacesData, setSpacesData] = useState<SockbaseSpaceDocument[]>([])
  const [rawAssignSpaces, setRawAssignSpaces] = useState<RawAssignEventSpace[]>([])

  const createSpaces = async (): Promise<void> => {
    if (rawSpaces.length === 0) return
    await createSpacesAsync(props.eventId, rawSpaces)
      .then(fetchedSpacesData => setSpacesData(fetchedSpacesData))
      .catch(err => { throw err })
  }

  const assignSpaces = async (): Promise<void> => {
    if (rawAssignSpaces.length === 0) return
    await assignSpacesAsync(rawAssignSpaces)
      .catch(err => { throw err })
  }

  const onInitialize = (): void => {
    const _spacesData = props.spaces.length > 0 ? props.spaces : spacesData
    if (props.spaces.length > 0 && step === 0) {
      setStep(2)
    }

    setStepComponents([
      <SpaceCreate key="space-create"
        rawSpaces={rawSpaces}
        nextStep={(rawSpaces: RawEventSpace[]) => {
          setRawSpaces(rawSpaces)
          setStep(1)
        }} />,
      <SpaceCreateConfirm key="space-create-confirm"
        rawSpaces={rawSpaces}
        createSpaces={createSpaces}
        prevStep={() => setStep(0)}
        nextStep={() => setStep(2)} />,
      <SpaceAssign key="space-assign"
        spacesData={_spacesData}
        rawAssignSpaces={rawAssignSpaces}
        nextStep={(rawSpaces: RawAssignEventSpace[]) => {
          setRawAssignSpaces(rawSpaces)
          setStep(3)
        }} />,
      <SpaceAssignConfirm key="space-assign-confirm"
        apps={props.apps}
        spacesData={_spacesData}
        rawAssignSpaces={rawAssignSpaces}
        handleSubmit={assignSpaces}
        prevStep={() => setStep(2)}
        nextStep={() => setStep(4)} />,
      <SpaceView key="space-view" eventId={props.eventId}/>
    ])
  }
  useEffect(onInitialize, [props.spaces, rawSpaces, spacesData, rawAssignSpaces, props.apps, props.eventId])

  return (
    <>
      {stepComponents?.[step]}
    </>
  )
}

export default StepContainer
