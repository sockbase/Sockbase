import { useState } from 'react'
import type { SockbaseEvent } from 'sockbase'

import StepProgress from '../../../Parts/StepProgress'
import Step1 from './Step1'

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
}
const StepContainer: React.FC<Props> = (props) => {
  const [step, setStep] = useState(0)
  const [stepComponents] = useState([
    <Step1 key="step1" spaces={props.event.spaces} nextStep={() => setStep(1)} />,
    <p key="step2" onClick={() => setStep(2)}>確認</p>,
    <p key="step3" onClick={() => setStep(3)}>決済</p>,
    <p key="step4">完了</p>
  ]) // 一旦仮組み

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

      {stepComponents[step] ?? 'エラー！'}
    </>
  )
}

export default StepContainer
