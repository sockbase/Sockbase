import { useEffect, useState } from 'react'
import type {
  SockbaseApplicationAddedResult,
  SockbaseAccount,
  SockbaseAccountSecure,
  SockbaseApplication,
  SockbaseEvent
} from 'sockbase'
import useFirebase from '../../../hooks/useFirebase'
import useUserData from '../../../hooks/useUserData'
import useApplication from '../../../hooks/useApplication'
import useDayjs from '../../../hooks/useDayjs'
import StepProgress from '../../../components/Parts/StepProgress'
import Introduction from './Introduction'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'
import Alert from '../../../components/Parts/Alert'

const stepProgresses = ['入力', '確認', '決済', '完了']

interface Props {
  eventId: string
  event: SockbaseEvent
  eyecatchURL: string | null
  isLoggedIn: boolean
}
const StepContainer: React.FC<Props> = (props) => {
  const { user, createUser } = useFirebase()
  const { updateUserDataAsync, getMyUserDataAsync } = useUserData()
  const { submitApplicationAsync } = useApplication()
  const { formatByDate } = useDayjs()

  const [step, setStep] = useState(0)
  const [circleCutData, setCircleCutData] = useState<string>()
  const [circleCutFile, setCircleCutFile] = useState<File>()
  const [app, setApp] = useState<SockbaseApplication>()
  const [leaderUserData, setLeaderUserData] = useState<SockbaseAccountSecure>()
  const [stepComponents, setStepComponents] = useState<JSX.Element[]>()

  const [userData, setUserData] = useState<SockbaseAccount | null>()
  const [appResult, setAppResult] = useState<SockbaseApplicationAddedResult>()

  const submitApplication: () => Promise<void> =
    async () => {
      if (!app || !leaderUserData || !circleCutFile) return

      if (!user) {
        const newUser = await createUser(leaderUserData.email, leaderUserData.password)
        await updateUserDataAsync(newUser.uid, leaderUserData)
      }

      const createdAppResult = await submitApplicationAsync(app, circleCutFile)
      setAppResult(createdAppResult)
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

  const onChangeStep: () => void =
    () => window.scrollTo(0, 0)
  useEffect(onChangeStep, [step])

  const onInitialize: () => void =
    () => {
      if (props.isLoggedIn === undefined) return
      if (userData === undefined) return

      setStepComponents([
        <Introduction key="introduction" nextStep={() => setStep(1)} event={props.event} eyecatchURL={props.eyecatchURL} />,
        <Step1 key="step1"
          eventId={props.eventId}
          event={props.event}
          app={app}
          leaderUserData={leaderUserData}
          circleCutFile={circleCutFile}
          isLoggedIn={props.isLoggedIn}
          prevStep={() => setStep(0)}
          nextStep={(app, leaderUserData, circleCutData, circleCutFile) => {
            setApp(app)
            setLeaderUserData(leaderUserData)
            setCircleCutData(circleCutData)
            setCircleCutFile(circleCutFile)
            setStep(2)
          }} />,
        <Step2 key="step2"
          event={props.event}
          app={app}
          leaderUserData={leaderUserData}
          circleCutData={circleCutData}
          userData={userData}
          submitApplication={submitApplication}
          prevStep={() => setStep(1)}
          nextStep={() => setStep(3)} />,
        <Step3 key="step3"
          appResult={appResult}
          app={app}
          event={props.event}
          email={userData?.email ?? leaderUserData?.email}
          nextStep={() => setStep(4)} />,
        <Step4 key="step4"
          appResult={appResult} />
      ])
    }
  useEffect(onInitialize, [props, app, leaderUserData, circleCutData, userData, appResult])

  return (
    <>
      <h1>{props.event.eventName} サークル参加申し込み受付</h1>

      {props.event.schedules.endApplication < new Date().getTime()
        ? <Alert type="danger" title="参加受付は終了しました">
          このイベントのサークル参加申し込み受付は <b>{formatByDate(props.event.schedules.endApplication, 'YYYY年M月D日')}</b> をもって終了しました。
        </Alert>
        : <>
          {props.event.descriptions.map((i, k) => <p key={k}>{i}</p>)}

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
