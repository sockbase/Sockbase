import { useEffect, useState } from 'react'
import { type User } from 'firebase/auth'
import {
  type SockbaseTicket,
  type SockbaseStoreDocument,
  type SockbaseAccountSecure,
  type SockbaseAccount,
  type SockbaseTicketAddedResult
} from 'sockbase'
import Alert from '../../../components/Parts/Alert'
import StepProgress from '../../../components/Parts/StepProgress'
import useDayjs from '../../../hooks/useDayjs'
import useFirebase from '../../../hooks/useFirebase'
import useStore from '../../../hooks/useStore'
import useUserData from '../../../hooks/useUserData'
import CheckAccount from './CheckAccount'
import Introduction from './Introduction'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'

const stepProgresses = ['説明', '入力', '確認', '決済', '完了']

interface Props {
  user: User | null | undefined
  store: SockbaseStoreDocument
  userData: SockbaseAccount | null
  isLoggedIn: boolean
}
const StepContainer: React.FC<Props> = (props) => {
  const { createTicketAsync } = useStore()
  const { createUser, loginByEmail, logout } = useFirebase()
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

    if (!props.user) {
      const newUser = await createUser(userData.email, userData.password)
      await updateUserDataAsync(newUser.uid, userData)
    } else if (props.userData && !props.userData.gender) {
      await updateUserDataAsync(props.user.uid, {
        ...props.userData,
        gender: userData?.gender
      })
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
      <CheckAccount key="checkAccount"
        user={props.user}
        login={async (email, password) => {
          await loginByEmail(email, password)
        }}
        logout={() => logout()}
        nextStep={() => setStep(1)} />,
      <Introduction key="introduction"
        prevStep={() => setStep(0)}
        nextStep={() => setStep(2)}
        store={props.store} />,
      <Step1 key="step1"
        store={props.store}
        ticketInfo={ticketInfo}
        fetchedUserData={props.userData}
        userData={userData}
        nextStep={(t: SockbaseTicket, u: SockbaseAccountSecure) => {
          setTicketInfo(t)
          setUserData(u)
          setStep(3)
        }}
        prevStep={() => setStep(1)} />,
      <Step2 key="step2"
        store={props.store}
        ticketInfo={ticketInfo}
        userData={userData}
        fetchedUserData={props.userData}
        isLoggedIn={props.isLoggedIn}
        submitProgressPercent={submitProgressPercent}
        submitTicket={async () => await handleSubmit()}
        nextStep={() => setStep(4)}
        prevStep={() => setStep(2)} />,
      <Step3 key="step3"
        store={props.store}
        ticketInfo={ticketInfo}
        ticketResult={ticketResult}
        email={props.userData?.email ?? userData?.email}
        nextStep={() => setStep(5)} />,
      <Step4 key="step4" store={props.store} ticketResult={ticketResult} />
    ])
  }
  useEffect(onInitialize, [
    props.user,
    props.store,
    props.userData,
    ticketInfo,
    userData,
    ticketResult,
    submitProgressPercent])

  return (
    <>
      <h1>{props.store.storeName} 申し込み受付</h1>

      {props.store.schedules.endApplication < new Date().getTime()
        ? <Alert type="danger" title="申し込み受付は終了しました">
          このチケットストアへの申し込み受付は <b>{formatByDate(props.store.schedules.endApplication - 1, 'YYYY年 M月 D日')}</b> をもって終了しました。
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
