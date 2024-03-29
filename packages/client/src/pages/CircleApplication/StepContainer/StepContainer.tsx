import { useEffect, useState } from 'react'
import {
  type SockbaseApplicationAddedResult,
  type SockbaseAccount,
  type SockbaseAccountSecure,
  type SockbaseApplication,
  type SockbaseEvent,
  type SockbaseApplicationPayload,
  type SockbaseApplicationLinks,
  type SockbaseApplicationDocument,
  type SockbaseApplicationLinksDocument,
  type SockbaseEventDocument
} from 'sockbase'
import Alert from '../../../components/Parts/Alert'
import StepProgress from '../../../components/Parts/StepProgress'
import useApplication from '../../../hooks/useApplication'
import useDayjs from '../../../hooks/useDayjs'
import useFirebase from '../../../hooks/useFirebase'
import useUserData from '../../../hooks/useUserData'
import CheckAccount from './CheckAccount'
import Introduction from './Introduction'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'

const stepProgresses = ['説明', '入力', '確認', '決済', '完了']

interface Props {
  eventId: string
  event: SockbaseEvent
  eyecatchURL: string | null
  isLoggedIn: boolean
  pastApps: SockbaseApplicationDocument[] | undefined
  pastAppLinks: Record<string, SockbaseApplicationLinksDocument | null> | undefined
  pastEvents: Record<string, SockbaseEventDocument> | undefined
}
const StepContainer: React.FC<Props> = (props) => {
  const { user, createUser, loginByEmail, logout } = useFirebase()
  const { updateUserDataAsync, getMyUserDataAsync } = useUserData()
  const { submitApplicationAsync, uploadCircleCutFileAsync } = useApplication()
  const { formatByDate } = useDayjs()

  const [step, setStep] = useState(0)
  const [circleCutData, setCircleCutData] = useState<string>()
  const [circleCutFile, setCircleCutFile] = useState<File>()
  const [app, setApp] = useState<SockbaseApplication>()
  const [links, setLinks] = useState<SockbaseApplicationLinks>()
  const [leaderUserData, setLeaderUserData] = useState<SockbaseAccountSecure>()
  const [stepComponents, setStepComponents] = useState<JSX.Element[]>()

  const [userData, setUserData] = useState<SockbaseAccount | null>()
  const [appResult, setAppResult] = useState<SockbaseApplicationAddedResult>()

  const [submitProgressPercent, setSubmitProgressPercent] = useState(0)

  const submitApplication: () => Promise<void> =
    async () => {
      if (!app || !links || !leaderUserData || !circleCutFile) return

      setSubmitProgressPercent(10)

      if (!user) {
        const newUser = await createUser(leaderUserData.email, leaderUserData.password)
        await updateUserDataAsync(newUser.uid, leaderUserData)
      }

      setSubmitProgressPercent(30)

      const payload: SockbaseApplicationPayload = {
        app,
        links
      }
      await submitApplicationAsync(payload)
        .then(async createdAppResult => {
          setSubmitProgressPercent(80)
          setAppResult(createdAppResult)

          await uploadCircleCutFileAsync(createdAppResult.hashId, circleCutFile)
            .then(async () => {
              setSubmitProgressPercent(100)
              await (new Promise((resolve) => setTimeout(resolve, 2000)))
            })
        })
        .catch(err => { throw err })
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
        <CheckAccount key="checkAccount"
          user={user}
          eyecatchURL={props.eyecatchURL}
          login={async (email, password) => {
            await loginByEmail(email, password)
          }}
          eventId={props.eventId}
          pastApps={props.pastApps}
          logout={() => logout()}
          nextStep={() => setStep(1)} />,
        <Introduction key="introduction"
          event={props.event}
          prevStep={() => setStep(0)}
          nextStep={() => setStep(2)} />,
        <Step1 key="step1"
          eventId={props.eventId}
          event={props.event}
          app={app}
          links={links}
          leaderUserData={leaderUserData}
          circleCutFile={circleCutFile}
          isLoggedIn={props.isLoggedIn}
          pastApps={props.pastApps}
          pastAppLinks={props.pastAppLinks}
          pastEvents={props.pastEvents}
          prevStep={() => setStep(1)}
          nextStep={(app, links, leaderUserData, circleCutData, circleCutFile) => {
            setApp(app)
            setLinks(links)
            setLeaderUserData(leaderUserData)
            setCircleCutData(circleCutData)
            setCircleCutFile(circleCutFile)
            setStep(3)
          }} />,
        <Step2 key="step2"
          event={props.event}
          app={app}
          links={links}
          leaderUserData={leaderUserData}
          circleCutData={circleCutData}
          userData={userData}
          submitProgressPercent={submitProgressPercent}
          submitApplication={submitApplication}
          nextStep={() => setStep(4)}
          prevStep={() => setStep(2)} />,
        <Step3 key="step3"
          appResult={appResult}
          app={app}
          event={props.event}
          email={userData?.email ?? leaderUserData?.email}
          nextStep={() => setStep(5)} />,
        <Step4 key="step4"
          appResult={appResult} />
      ])
    }
  useEffect(onInitialize, [
    props,
    user,
    app,
    links,
    leaderUserData,
    circleCutData,
    userData,
    appResult,
    submitProgressPercent])

  return (
    <>
      <h1>{props.event.eventName} サークル参加申し込み受付</h1>

      {props.event.schedules.endApplication < new Date().getTime()
        ? <Alert type="danger" title="参加受付は終了しました">
          このイベントのサークル参加申し込み受付は <b>{formatByDate(props.event.schedules.endApplication - 1, 'YYYY年M月D日')}</b> をもって終了しました。
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
