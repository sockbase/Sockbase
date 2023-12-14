import { useEffect, useState } from 'react'
import {
  type SockbaseTicket,
  type SockbaseStoreDocument,
  type SockbaseAccountSecure,
  type SockbaseAccount,
  type SockbaseTicketAddedResult
} from 'sockbase'
import StepProgress from '../../../components/Parts/StepProgress'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'
import Introduction from './Introduction'
import useStore from '../../../hooks/useStore'
import useFirebase from '../../../hooks/useFirebase'
import useUserData from '../../../hooks/useUserData'
import Alert from '../../../components/Parts/Alert'
import useDayjs from '../../../hooks/useDayjs'

const stepProgresses = ['入力', '確認', '決済', '完了']

interface Props {
  store: SockbaseStoreDocument
  userData: SockbaseAccount | null
  isLoggedIn: boolean
}
const StepContainer: React.FC<Props> = (props) => {
  const { createTicketAsync } = useStore()
  const { createUser } = useFirebase()
  const { updateUserDataAsync } = useUserData()
  const { formatByDate } = useDayjs()

  const [step, setStep] = useState(0)
  const [stepComponents, setStepComponents] = useState<JSX.Element[]>()

  const [ticketInfo, setTicketInfo] = useState<SockbaseTicket>()
  const [userData, setUserData] = useState<SockbaseAccountSecure>()
  const [ticketResult, setTicketResult] = useState<SockbaseTicketAddedResult>()

  const [submitProgressPercent, setSubmitProgressPercent] = useState(0)

  const onChangeStep: () => void =
    () => window.scrollTo(0, 0)
  useEffect(onChangeStep, [step])

  const handleSubmit = async (): Promise<void> => {
    if (!ticketInfo || !userData) return

    setSubmitProgressPercent(10)

    if (!props.isLoggedIn) {
      const newUser = await createUser(userData.email, userData.password)
      await updateUserDataAsync(newUser.uid, userData)
    }

    setSubmitProgressPercent(30)

    await createTicketAsync(ticketInfo)
      .then(async (result) => {
        setTicketResult(result)
        setSubmitProgressPercent(100)
        await (new Promise((resolve) => setTimeout(resolve, 2000)))
      })
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
        submitProgressPercent={submitProgressPercent}
        submitTicket={async () => await handleSubmit()}
        nextStep={() => setStep(3)}
        prevStep={() => setStep(1)} />,
      <Step3 key="step3"
        store={props.store}
        ticketInfo={ticketInfo}
        ticketResult={ticketResult}
        email={props.userData?.email ?? userData?.email}
        nextStep={() => setStep(4)} />,
      <Step4 key="step4" store={props.store} ticketResult={ticketResult} />
    ])
  }
  useEffect(onInitialize, [props.store, props.userData, ticketInfo, userData, ticketResult, submitProgressPercent])

  return (
    <>
      <h1>{props.store.storeName} 申し込み受付</h1>

      {props.store.schedules.endApplication < new Date().getTime()
        ? <Alert type="danger" title="申し込み受付は終了しました">
          このチケットストアへの申し込み受付は <b>{formatByDate(props.store.schedules.endApplication, 'YYYY年M月D日')}</b> をもって終了しました。
        </Alert>
        : <>
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
        </>}
    </>
  )
}

export default StepContainer
