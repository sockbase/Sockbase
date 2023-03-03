import { useEffect, useState } from 'react'
import { type User } from 'firebase/auth'

import type { SockbaseAccount, SockbaseAccountSecure, SockbaseApplication, SockbaseEvent } from 'sockbase'

import useFirebase from '../../../../hooks/useFirebase'
import useUserData from '../../../../hooks/useUserData'
import useEvent from '../../../../hooks/useEvent'

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
const paymentMethods: IPaymentMethod[] =
  [
    {
      id: 'online',
      description: 'クレジットカード決済(推奨)'
    },
    {
      id: 'bankTransfer',
      description: '銀行振込'
    }
  ]

interface Props {
  eventId: string
  event: SockbaseEvent
  isLoggedIn: boolean
}
const StepContainer: React.FC<Props> = (props) => {
  const { user, createUser } = useFirebase()
  const { getMyUserDataAsync } = useUserData()
  const { submitApplicationAsync } = useEvent()

  const [step, setStep] = useState(0)
  const [app, setApp] = useState<SockbaseApplication>()
  const [leader, setLeader] = useState<SockbaseAccountSecure>()
  const [stepComponents, setStepComponents] = useState<JSX.Element[]>()

  const [userData, setUserData] = useState<SockbaseAccount | null>()
  const [appHashId, setAppHashId] = useState<string>()

  const submitApplicationWithUserAsync: (user: User, eventId: string, app: SockbaseApplication) => Promise<string> =
    async (user, eventId, app) => {
      const createdAppHashId = await submitApplicationAsync(user, eventId, app)
        .catch(err => {
          throw err
        })
      // TODO 決済管理情報作成(サーバ側でやったほうが良いかも)
      // TODO 決済管理情報取得
      return createdAppHashId
    }

  const submitApplication: () => Promise<void> =
    async () => {
      if (!app || !leader) return

      if (!user) {
        const newUser = await createUser(leader.email, leader.password)
          .catch(err => {
            throw err
          })
        const createdAppHashId = await submitApplicationWithUserAsync(newUser, props.eventId, app)
        setAppHashId(createdAppHashId)
        return
      }

      const createdAppHashId = await submitApplicationWithUserAsync(user, props.eventId, app)
      setAppHashId(createdAppHashId)
    }

  const fetchUserData: () => void =
    () => {
      const fetchUserDataAsync: () => Promise<void> =
        async () => {
          const userData = await getMyUserDataAsync()
          setUserData(userData)
        }
      fetchUserDataAsync().catch(err => {
        throw err
      })
    }
  useEffect(fetchUserData, [getMyUserDataAsync])

  const onInitialize: () => void =
    () => {
      if (props.isLoggedIn === undefined) return
      if (userData === undefined) return

      setStepComponents([
        <Introduction key="introduction" nextStep={() => setStep(1)} event={props.event} />,
        <Step1 key="step1"
          app={app}
          leader={leader}
          isLoggedIn={props.isLoggedIn} spaces={props.event.spaces}
          paymentMethods={paymentMethods}
          prevStep={() => setStep(0)}
          nextStep={(app, leader) => {
            setApp(app)
            setLeader(leader)
            setStep(2)
          }} />,
        <Step2 key="step2"
          app={app}
          leader={leader}
          spaces={props.event.spaces}
          userData={userData}
          paymentMethods={paymentMethods}
          submitApplication={submitApplication}
          prevStep={() => setStep(1)}
          nextStep={() => setStep(3)} />,
        <Step3 key="step3"
          appHashId={appHashId}
          nextStep={() => setStep(4)} />,
        <Step4 key="step4" />
      ])
    }
  useEffect(onInitialize, [props.isLoggedIn, app, leader, userData, appHashId])

  return (
    <>
      <h1>{props.event.eventName} サークル参加申し込み受付フォーム</h1>
      {
        props.event.descriptions.map((i, k) => <p key={k}>{i}</p>)
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
