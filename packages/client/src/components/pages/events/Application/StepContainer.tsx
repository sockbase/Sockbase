import { useEffect, useState } from 'react'
import type { SockbaseCircleApplication, SockbaseEvent } from 'sockbase'

import StepProgress from '../../../Parts/StepProgress'
import Step1 from './Step1'
import Step2 from './Step2'

const stepProgresses = [
  {
    text: '入力',
    isActive: true
  },
  {
    text: '確認',
    isActive: false
  },
  {
    text: '決済',
    isActive: false
  },
  {
    text: '完了',
    isActive: false
  }
]

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
        <Step1 isLoggedIn={props.isLoggedIn} key="step1" spaces={props.event.spaces} nextStep={app => {
          setApp(app)
          setStep(1)
        }} />,
        <Step2 key="step2" app={app} />,
        <p key="step3" onClick={() => setStep(3)}>決済</p>,
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
          text: i.text,
          isActive: k === step
        }))
      } />

      {stepComponents?.[step] ?? 'エラー！'}
    </>
  )
}

export default StepContainer
