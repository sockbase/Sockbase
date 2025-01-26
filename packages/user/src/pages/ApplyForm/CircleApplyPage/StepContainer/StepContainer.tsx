import { useCallback, useEffect, useMemo, useState } from 'react'
import { type User } from 'firebase/auth'
import sockbaseShared from 'shared'
import Alert from '../../../../components/Parts/Alert'
import Loading from '../../../../components/Parts/Loading'
import StepProgress from '../../../../components/Parts/StepProgress'
import useDayjs from '../../../../hooks/useDayjs'
import CheckAccount from './CheckAccount'
import CircleCut from './CircleCut'
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

const stepProgresses = ['説明', '入力', '確認', '決済', '提出']

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
const StepContainer: React.FC<Props> = props => {
  const { formatByDate } = useDayjs()

  const [step, setStep] = useState(0)

  const [app, setApp] = useState<SockbaseApplication>()
  const [links, setLinks] = useState<SockbaseApplicationLinks>()
  const [userData, setUserData] = useState<SockbaseAccountSecure>()

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
    if (!app || !links) return

    setSubmitProgressPercent(10)

    if (!props.user) {
      if (!userData) {
        throw new Error('userData not provided')
      }
      const newUser = await props.createUserAsync(userData.email, userData.password)
      await props.updateUserDataAsync(newUser.uid, userData)
    }
    else if (props.userData && !props.userData?.gender) {
      await props.updateUserDataAsync(props.user.uid, {
        ...props.userData,
        gender: userData?.gender
      })
    }

    setSubmitProgressPercent(50)

    await props.submitApplicationAsync({ app, links })
      .then(async result => {
        setSubmitProgressPercent(100)
        setAddedResult(result)
        await (new Promise(resolve => setTimeout(resolve, 2000)))
      })
      .catch(err => { throw err })
  }, [app, links, userData])

  useEffect(() => window.scrollTo(0, 0), [step])

  const steps = useMemo(() => {
    if (!props.event) return
    return ([
      <CheckAccount
        event={props.event}
        eyecatchURL={props.eyecatchURL}
        key="checkAccount"
        loginAsync={props.loginAsync}
        logoutAsync={props.logoutAsync}
        nextStep={() => setStep(1)}
        pastApps={props.pastApps}
        user={props.user} />,
      <Introduction
        event={props.event}
        key="introduction"
        nextStep={() => setStep(2)}
        prevStep={() => setStep(0)} />,
      <Input
        app={app}
        event={props.event}
        fetchedUserData={props.userData}
        key="input"
        links={links}
        nextStep={(a, l, u) => {
          setApp(a)
          setLinks(l)
          setUserData(u)
          setStep(3)
        }}
        pastAppLinks={props.pastAppLinks}
        pastApps={props.pastApps}
        pastEvents={props.pastEvents}
        prevStep={() => setStep(1)}
        userData={userData} />,
      <Confirm
        app={app}
        event={props.event}
        fetchedUserData={props.userData}
        key="confirm"
        links={links}
        nextStep={() => setStep(4)}
        prevStep={() => setStep(2)}
        selectedGenre={selectedGenre}
        selectedPaymentMethod={selectedPaymentMethod}
        selectedSpace={selectedSpace}
        submitAsync={handleSubmitAsync}
        submitProgressPercent={submitProgressPercent}
        userData={userData} />,
      <Payment
        addedResult={addedResult}
        app={app}
        event={props.event}
        key="payment"
        nextStep={() => setStep(5)}
        selectedSpace={selectedSpace}
        user={props.user} />,
      <CircleCut
        addedResult={addedResult}
        app={app}
        event={props.event}
        key="circle-cut"
        nextStep={() => setStep(6)} />,
      <Complete
        addedResult={addedResult}
        event={props.event}
        key="complete" />
    ])
  }, [
    props.event,
    props.eyecatchURL,
    props.user,
    props.userData,
    props.pastApps,
    props.pastAppLinks,
    props.pastEvents,
    app,
    links,
    userData,
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
      {props.event === undefined && (
        <Loading text="イベント情報" />
      )}

      {props.event === null && (
        <Alert
          title="イベントが見つかりません"
          type="error">
          指定された ID のイベントを見つけることができませんでした。<br />
          URL が正しく入力されていることを確認してください。
        </Alert>
      )}

      {props.event && (
        <>
          <h1>{props.event.name} サークル参加申し込み受付</h1>

          {now < props.event.schedules.startApplication && (
            <Alert
              title="受付期間前です"
              type="error">
              このイベントのサークル参加申し込み受付は <b>{formatByDate(props.event.schedules.startApplication, 'YYYY年 M月 D日 H時mm分')}</b> から開始予定です。
            </Alert>
          )}

          {props.event.schedules.endApplication <= now && (
            <Alert
              title="受付を終了しました"
              type="error">
              このイベントのサークル参加申し込み受付は <b>{formatByDate(props.event.schedules.endApplication - 1, 'YYYY年 M月 D日')}</b> をもって終了しました。
            </Alert>
          )}

          {props.event.schedules.startApplication < now && now <= props.event.schedules.endApplication && (
            <>
              {props.event.descriptions.map((d, k) => <p key={k}>{d}</p>)}
              <StepProgress
                steps={stepProgresses.map((s, k) => ({
                  text: s,
                  isActive: k === step - 1
                }))} />
              {steps?.[step]}
            </>
          )}
        </>
      )}
    </>
  )
}

export default StepContainer
