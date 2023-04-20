import { useEffect, useState } from 'react'
import type { SockbaseStore } from 'sockbase'

import StepProgress from '../../../Parts/StepProgress'
import Introduction from './Introduction'
import Step1 from './Step1'

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

  const onInitialize: () => void =
    () => {
      if (props.isLoggedIn === undefined) return

      setStepComponents([
        <Introduction key="introduction" nextStep={() => setStep(1)} store={props.store} />,
        <Step1 key="step1" prevStep={() => setStep(0)} store={props.store} />
      ])
    }
  useEffect(onInitialize, [props.isLoggedIn])

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
