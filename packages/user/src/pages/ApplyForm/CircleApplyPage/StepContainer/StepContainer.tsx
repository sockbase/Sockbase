import { useCallback, useEffect, useMemo, useState } from 'react'
import { type User } from 'firebase/auth'
import sockbaseShared from 'shared'
import CircleApplicationComplete from '../../../../components/CommonComplete/CircleApplicationComplete'
import Alert from '../../../../components/Parts/Alert'
import Loading from '../../../../components/Parts/Loading'
import StepProgress from '../../../../components/Parts/StepProgress'
import useDayjs from '../../../../hooks/useDayjs'
import useVoucher from '../../../../hooks/useVoucher'
import CheckAccount from './CheckAccount'
import Confirm from './Confirm'
import Input from './Input'
import Introduction from './Introduction'
import Payment from './Payment'
import ThankYouPayment from './ThankYouPayment'
import type {
  SockbaseAccount,
  SockbaseAccountSecure,
  SockbaseApplication,
  SockbaseApplicationCreateResult,
  SockbaseApplicationDocument,
  SockbaseApplicationLinks,
  SockbaseApplicationPayload,
  SockbaseEventDocument,
  SockbaseVoucherDocument
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
  submitApplicationAsync: (payload: SockbaseApplicationPayload) => Promise<SockbaseApplicationCreateResult>
  updateCircleCutFileAsync: (appHashId: string, circleCutFile: File) => Promise<void>
  getVoucherCodeAsync: (eventId: string, typeId: string, code: string) => Promise<SockbaseVoucherDocument | null | undefined>
}
const StepContainer: React.FC<Props> = props => {
  const { formatByDate } = useDayjs()
  const { calculatePaymentAmount } = useVoucher()

  const [step, setStep] = useState(0)

  const [app, setApp] = useState<SockbaseApplication>()
  const [links, setLinks] = useState<SockbaseApplicationLinks>()
  const [userData, setUserData] = useState<SockbaseAccountSecure>()

  const [voucherCode, setVoucherCode] = useState('')
  const [voucher, setVoucher] = useState<SockbaseVoucherDocument | null>()

  const [submitProgressPercent, setSubmitProgressPercent] = useState(0)
  const [addedResult, setAddedResult] = useState<SockbaseApplicationCreateResult>()

  const selectedSpace = useMemo(() => {
    if (!props.event || !app) return
    return props.event.spaces.filter(s => s.id === app.spaceId)[0]
  }, [props.event, app])

  const paymentAmount = useMemo(() => {
    if (!selectedSpace) return
    return calculatePaymentAmount(selectedSpace.price, voucher?.amount)
  }, [selectedSpace, voucher])

  const selectedGenre = useMemo(() => {
    if (!props.event || !app) return
    return props.event.genres.filter(g => g.id === app.circle.genre)[0]
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

    await props.submitApplicationAsync({
      app,
      links,
      voucherCode: voucher ? voucher.voucherCode : null
    })
      .then(async result => {
        setSubmitProgressPercent(100)
        setAddedResult(result)
        await (new Promise(resolve => setTimeout(resolve, 2000)))
      })
      .catch(err => { throw err })
  }, [app, links, voucher, userData])

  const getVoucherCodeAsync = useCallback(async (typeId: string, code: string) => {
    if (!props.event) return
    const eventId = props.event.id
    props.getVoucherCodeAsync(eventId, typeId, code)
      .then(setVoucher)
      .catch(err => { throw err })
  }, [props.event])

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
        getVoucherByCodeAsync={getVoucherCodeAsync}
        key="input"
        links={links}
        nextStep={(a, l, u, v) => {
          setApp(a)
          setLinks(l)
          setUserData(u)
          setStep(3)
          setVoucherCode(v)
        }}
        pastAppLinks={props.pastAppLinks}
        pastApps={props.pastApps}
        pastEvents={props.pastEvents}
        prevStep={() => setStep(1)}
        resetVoucher={() => setVoucher(undefined)}
        userData={userData}
        voucher={voucher}
        voucherCode={voucherCode} />,
      <Confirm
        app={app}
        event={props.event}
        fetchedUserData={props.userData}
        key="confirm"
        links={links}
        nextStep={() => setStep(4)}
        paymentAmount={paymentAmount}
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
      <ThankYouPayment
        addedResult={addedResult}
        app={app}
        event={props.event}
        key="circle-cut"
        nextStep={() => setStep(6)} />,
      <CircleApplicationComplete
        event={props.event}
        hashId={addedResult?.hashId}
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
    voucherCode,
    voucher,
    selectedSpace,
    selectedGenre,
    selectedPaymentMethod,
    handleSubmitAsync,
    submitProgressPercent,
    addedResult,
    paymentAmount
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
