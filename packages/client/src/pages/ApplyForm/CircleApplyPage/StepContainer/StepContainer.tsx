import { useCallback, useEffect, useMemo, useState } from 'react'
import { type User } from 'firebase/auth'
import sockbaseShared from 'shared'
import Alert from '../../../../components/Parts/Alert'
import StepProgress from '../../../../components/Parts/StepProgress'
import useDayjs from '../../../../hooks/useDayjs'
import CheckAccount from './CheckAccount'
import Complete from './Complete'
import Confirm from './Confirm'
import Input from './Input'
import Introduction from './Introduction'
import Payment from './Payment'
import type {
  SockbaseAccount,
  SockbaseAccountSecure,
  SockbaseApplication,
  SockbaseApplicationAddedResult,
  SockbaseApplicationDocument,
  SockbaseApplicationLinks,
  SockbaseApplicationPayload,
  SockbaseEventDocument
} from 'sockbase'

const stepProgresses = ['説明', '入力', '確認', '決済', '完了']

interface Props {
  user: User | null | undefined
  userData: SockbaseAccount | null | undefined
  event: SockbaseEventDocument | null | undefined
  eyecatchURL: string | null | undefined
  pastApps: SockbaseApplicationDocument[] | null | undefined
  pastAppLinks: Record<string, SockbaseApplicationLinks | null> | null | undefined
  pastEvents: Record<string, SockbaseEventDocument> | null | undefined
  loginAsync: (email: string, password: string) => Promise<void>
  logoutAsync: () => Promise<void>
  createUserAsync: (email: string, password: string) => Promise<User>
  updateUserDataAsync: (userId: string, userData: SockbaseAccount) => Promise<void>
  submitApplicationAsync: (payload: SockbaseApplicationPayload) => Promise<SockbaseApplicationAddedResult>
  updateCircleCutFileAsync: (appHashId: string, circleCutFile: File) => Promise<void>
}
const StepContainer: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()

  const [step, setStep] = useState(0)

  const [app, setApp] = useState<SockbaseApplication>()
  const [links, setLinks] = useState<SockbaseApplicationLinks>()
  const [userData, setUserData] = useState<SockbaseAccountSecure>()
  const [circleCutData, setCircleCutData] = useState<string>()
  const [circleCutFile, setCircleCutFile] = useState<File>()

  const [submitProgressPercent, setSubmitProgressPercent] = useState(0)
  const [addedResult, setAddedResult] = useState<SockbaseApplicationAddedResult>()

  const selectedGenre = useMemo(() => {
    if (!props.event || !app) return
    return props.event.genres.filter(g => g.id === app.circle.genre)[0]
  }, [props.event, app])

  const selectedSpace = useMemo(() => {
    if (!props.event || !app) return
    return props.event.spaces.filter(s => s.id === app.spaceId)[0]
  }, [props.event, app])

  const selectedPaymentMethod = useMemo(() => {
    if (!app) return
    return sockbaseShared.constants.payment.methods
      .filter(m => m.id === app?.paymentMethod)[0]
  }, [app])

  const handleSubmitAsync = useCallback(async () => {
    if (!app || !links || !circleCutFile) return

    setSubmitProgressPercent(10)

    if (!props.user) {
      if (!userData) {
        throw new Error('userData not provided')
      }
      const newUser = await props.createUserAsync(userData.email, userData.password)
      await props.updateUserDataAsync(newUser.uid, userData)
    } else if (props.userData && !props.userData?.gender) {
      await props.updateUserDataAsync(props.user.uid, {
        ...props.userData,
        gender: userData?.gender
      })
    }

    setSubmitProgressPercent(30)

    await props.submitApplicationAsync({ app, links })
      .then(async result => {
        setSubmitProgressPercent(80)
        setAddedResult(result)

        await props.updateCircleCutFileAsync(result.hashId, circleCutFile)
          .then(async () => {
            setSubmitProgressPercent(100)
            await (new Promise((resolve) => setTimeout(resolve, 2000)))
          })
          .catch(err => { throw err })
      })
      .catch(err => { throw err })
  }, [app, links, userData, circleCutFile])

  useEffect(() => window.scrollTo(0, 0), [step])

  const steps = useMemo(() => {
    if (!props.event) return
    return ([
      <CheckAccount
        key="checkAccount"
        event={props.event}
        pastApps={props.pastApps}
        eyecatchURL={props.eyecatchURL}
        user={props.user}
        loginAsync={props.loginAsync}
        logoutAsync={props.logoutAsync}
        nextStep={() => setStep(1)} />,
      <Introduction
        key="introduction"
        event={props.event}
        prevStep={() => setStep(0)}
        nextStep={() => setStep(2)} />,
      <Input
        key="input"
        event={props.event}
        app={app}
        links={links}
        userData={userData}
        circleCutFile={circleCutFile}
        pastApps={props.pastApps}
        pastAppLinks={props.pastAppLinks}
        pastEvents={props.pastEvents}
        fetchedUserData={props.userData}
        prevStep={() => setStep(1)}
        nextStep={(a, l, u, cd, cf) => {
          setApp(a)
          setLinks(l)
          setUserData(u)
          setCircleCutData(cd)
          setCircleCutFile(cf)
          setStep(3)
        }}/>,
      <Confirm
        key="confirm"
        event={props.event}
        app={app}
        circleCutData={circleCutData}
        links={links}
        userData={userData}
        fetchedUserData={props.userData}
        selectedSpace={selectedSpace}
        selectedGenre={selectedGenre}
        selectedPaymentMethod={selectedPaymentMethod}
        submitProgressPercent={submitProgressPercent}
        nextStep={() => setStep(4)}
        prevStep={() => setStep(2)}
        submitAsync={handleSubmitAsync} />,
      <Payment
        key="payment"
        user={props.user}
        event={props.event}
        app={app}
        addedResult={addedResult}
        selectedSpace={selectedSpace}
        nextStep={() => setStep(5)} />,
      <Complete
        key="complete"
        event={props.event}
        addedResult={addedResult} />
    ])
  }, [
    props.event,
    props.user,
    props.userData,
    props.pastApps,
    props.pastAppLinks,
    props.pastEvents,
    app,
    links,
    userData,
    circleCutFile,
    circleCutData,
    selectedSpace,
    selectedGenre,
    selectedPaymentMethod,
    handleSubmitAsync,
    submitProgressPercent,
    addedResult
  ])

  const now = new Date().getTime()

  return (
    <>
      {props.event === null && <Alert title="イベントが見つかりません" type="danger">
        指定されたIDのイベントを見つけることができませんでした。<br />
        URLが正しく入力されていることを確認してください。
      </Alert>}
      {props.event && <>
        <h1>{props.event.eventName} サークル参加申し込み受付</h1>
        {props.event.schedules.endApplication < now
          ? <Alert type="danger" title="参加受付は終了しました">
          このイベントのサークル参加申し込み受付は <b>{formatByDate(props.event.schedules.endApplication - 1, 'YYYY年 M月 D日')}</b> をもって終了しました。
          </Alert>
          : <>
            {props.event.descriptions.map((d, k) => <p key={k}>{d}</p>)}
            <StepProgress
              steps={stepProgresses.map((s, k) => ({
                text: s,
                isActive: k === step - 1
              }))} />
            {steps?.[step]}
          </>}
      </>}
    </>
  )
}

export default StepContainer
