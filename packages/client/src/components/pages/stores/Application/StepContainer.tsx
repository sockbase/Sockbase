import { useEffect, useState } from 'react'
import type { SockbaseTicketApplication, SockbaseStore, SockbaseAccountSecure } from 'sockbase'

import StepProgress from '../../../Parts/StepProgress'
import Introduction from './Introduction'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'

export interface IPaymentMethod {
  id: string
  description: string
}

const stepProgresses = ['入力', '確認', '決済', '完了']

interface Props {
  storeId: string
  store: SockbaseStore
  isLoggedIn: boolean
}
const StepContainer: React.FC<Props> = (props) => {
  const [step, setStep] = useState(0)
  const [stepComponents, setStepComponents] = useState<JSX.Element[]>()

  const onChangeStep: () => void =
    () => window.scrollTo(0, 0)
  useEffect(onChangeStep, [step])

  const [app, setApp] = useState<SockbaseTicketApplication>()
  const [userData, setUserData] = useState<SockbaseAccountSecure>()

  const onInitialize: () => void =
    () => {
      if (props.isLoggedIn === undefined) return

      setStepComponents([
        <Introduction key="introduction" nextStep={() => setStep(1)} store={props.store} />,
        <Step1 key="step1"
          app={app}
          storeId={props.storeId}
          store={props.store}
          userData={userData}
          prevStep={() => setStep(0)}
          nextStep={(_app, _userData) => {
            setApp(_app)
            setUserData(_userData)
            setStep(2)
          }} />,
        <Step2 key="step2" app={app} userData={userData} prevStep={() => setStep(1)} nextStep={() => setStep(3)} />,
        <Step3 key="step3" nextStep={() => setStep(4)} />,
        <Step4 key="step4" />
      ])
    }
  useEffect(onInitialize, [props.isLoggedIn, app, userData])

  return (
    <>
      <h1>{props.store.storeName} 申し込み受付フォーム</h1>
      {
        props.store.descriptions.map((i, k) => <p key={k}>{i}</p>)
      }

      <StepProgress steps={
        stepProgresses.map((i, k) => ({
          text: i,
          isActive: k === step - 1
        }))
      } />

      {stepComponents?.[step] ?? 'エラー！'}
    </>
  )
}

export default StepContainer
