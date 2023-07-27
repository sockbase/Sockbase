import { useEffect, useState } from 'react'
import StepProgress from '../../../Parts/StepProgress'
import { type SockbaseAccount, type SockbaseStoreDocument, type SockbaseTicketUserDocument } from 'sockbase'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'

const stepProgresses = ['入力', '確認', '完了']

interface Props {
  ticketHashId: string
  store: SockbaseStoreDocument
  ticketUser: SockbaseTicketUserDocument
  userData: SockbaseAccount | null
}
const StepContainer: React.FC<Props> = (props) => {
  const [step, setStep] = useState(0)
  const [stepComponents, setStepComponents] = useState<React.ReactNode[]>()

  const submitAssignTicket = async (): Promise<void> => {
    alert('送信しました')
  }

  const onInitialize = (): void => {
    setStepComponents([
      <Step1 key="step1"
        store={props.store}
        ticketUser={props.ticketUser}
        nextStep={() => setStep(1)} />,
      <Step2 key="step2"
        store={props.store}
        ticketUser={props.ticketUser}
        userData={props.userData}
        submitAssignTicket={submitAssignTicket}
        nextStep={() => setStep(2)}
        prevStep={() => setStep(0)} />,
      <Step3 key="step3" ticketHashId={props.ticketHashId} />
    ])
  }
  useEffect(onInitialize, [props.store, props.ticketUser, props.userData])

  return (
    <>
      <h1>{props.store.storeName} 受け取りページ</h1>

      <StepProgress steps={
        stepProgresses.map((i, k) => ({
          text: i,
          isActive: k === step
        }))
      } />

      {stepComponents?.[step] ?? ''}
    </>
  )
}

export default StepContainer
