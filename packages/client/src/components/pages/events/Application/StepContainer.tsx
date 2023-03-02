import { useEffect, useState } from 'react'
import type { SockbaseCircleApplication, SockbaseEvent } from 'sockbase'

import StepProgress from '../../../Parts/StepProgress'
import Introduction from './Introduction'
import Step1 from './Step1'
import Step2 from './Step2'

const stepProgresses = ['説明', '入力', '確認', '決済', '完了']

interface Props {
  event: SockbaseEvent
  isLoggedIn: boolean
}
const StepContainer: React.FC<Props> = (props) => {
  const [step, setStep] = useState(0)
  const [app, setApp] = useState<SockbaseCircleApplication>()

  const [stepComponents, setStepComponents] = useState<JSX.Element[]>() // 一旦仮組み

  const onInitialize: () => void =
    () => {
      if (props.isLoggedIn === undefined) return

      setStepComponents([
        <Introduction key="introduction" nextStep={() => setStep(1)} />,
        <Step1 key="step1" app={app} isLoggedIn={props.isLoggedIn} spaces={props.event.spaces} prevStep={() => setStep(0)} nextStep={app => {
          setApp(app)
          setStep(2)
        }} />,
        <Step2 key="step2" app={app} prevStep={() => setStep(1)} nextStep={() => setStep(3)} />,
        <p key="step3" onClick={() => setStep(4)}>決済</p>,
        <p key="step4">完了</p>
      ])
    }
  useEffect(onInitialize, [props.isLoggedIn, app])

  return (
    <>
      <h1>{props.event.eventName} サークル参加申込み受付フォーム</h1>
      {
        props.event.descriptions.map((i, k) => <p key={k}>{i}</p>)
      }

      <StepProgress steps={
        stepProgresses.map((i, k) => ({
          text: i,
          isActive: k === step
        }))
      } />

      {stepComponents?.[step] ?? 'エラー！'}
    </>
  )
}

export default StepContainer
