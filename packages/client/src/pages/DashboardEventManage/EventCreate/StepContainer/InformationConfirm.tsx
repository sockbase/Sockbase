import { useCallback, useState } from 'react'
import FormButton from '../../../../components/Form/Button'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import EventInfo from '../../../../components/Parts/EventInfo'
import type { SockbaseEvent } from 'sockbase'

interface Props {
  eventId: string | null | undefined
  event: SockbaseEvent | null | undefined
  eyecatchData: string | null | undefined
  prevStep: () => void
  nextStep: () => void
  handleCreateAsync: () => Promise<void>
}
const InformationConfirm: React.FC<Props> = (props) => {
  const [isProcess, setProcess] = useState(false)

  const handleCreate = useCallback(() => {
    setProcess(true)
    props.handleCreateAsync()
      .then(() => props.nextStep())
      .catch(err => {
        console.error(err)
        setProcess(false)
      })
  }, [props.handleCreateAsync])

  return (
    <>
      <h2>STEP2: 入力内容の確認</h2>

      <EventInfo
        eventId={props.eventId}
        event={props.event}
        eyecatchData={props.eyecatchData} />

      <FormSection>
        <FormItem inlined>
          <FormButton onClick={handleCreate} disabled={isProcess} inlined>作成する</FormButton>
          <FormButton onClick={props.prevStep} color="default" disabled={isProcess} inlined>修正する</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default InformationConfirm
