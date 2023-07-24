import { useEffect, useState } from 'react'
import { type SockbaseTicket, type SockbaseStoreDocument, type SockbaseAccountSecure, type SockbaseAccount } from 'sockbase'
import StepProgress from '../../../Parts/StepProgress'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'
import Introduction from './Introduction'

const stepProgresses = ['入力', '確認', '決済', '完了']

interface Props {
  store: SockbaseStoreDocument
  userData: SockbaseAccount | null
  isLoggedIn: boolean
}
const StepContainerComponent: React.FC<Props> = (props) => {
  const [step, setStep] = useState(0)
  const [stepComponents, setStepComponents] = useState<JSX.Element[]>()

  const [ticketInfo, setTicketInfo] = useState<SockbaseTicket>()
  const [userData, setUserData] = useState<SockbaseAccountSecure>()

  const onChangeStep: () => void =
    () => window.scrollTo(0, 0)
  useEffect(onChangeStep, [step])

  const handleSubmit = async (): Promise<void> => {
    if (!ticketInfo || !userData) return

    alert('申し込みが完了しました')
    setStep(3)
  }

  const onInitialize = (): void => {
    setStepComponents([
      <Introduction key="introduction" nextStep={() => setStep(1)} store={props.store} />,
      <Step1 key="step1"
        store={props.store}
        isLoggedIn={props.isLoggedIn}
        ticketInfo={ticketInfo}
        userData={userData}
        nextStep={(t: SockbaseTicket, u: SockbaseAccountSecure) => {
          setTicketInfo(t)
          setUserData(u)
          setStep(2)
        }}
        prevStep={() => setStep(0)} />,
      <Step2 key="step2"
        store={props.store}
        ticketInfo={ticketInfo}
        userData={userData}
        fetchedUserData={props.userData}
        isLoggedIn={props.isLoggedIn}
        nextStep={async () => await handleSubmit()}
        prevStep={() => setStep(1)} />,
      <Step3 key="step3" store={props.store} ticketInfo={ticketInfo} nextStep={() => setStep(4)} />,
      <Step4 key="step4" />
    ])
  }
  useEffect(onInitialize, [props.store, props.userData, ticketInfo, userData])

  return (
    <>
      <h1>{props.store.storeName} チケット申し込みフォーム</h1>

      <ul>
        {props.store.descriptions.map((d, k) => <li key={k}>{d}</li>)}
      </ul>

      <StepProgress steps={
        stepProgresses.map((i, k) => ({
          text: i,
          isActive: k === step - 1
        }))
      } />

      {stepComponents?.[step] ?? ''}
    </>
  )
}

export default StepContainerComponent
