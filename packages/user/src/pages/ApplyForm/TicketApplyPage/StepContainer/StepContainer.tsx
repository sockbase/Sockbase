import { useCallback, useEffect, useMemo, useState } from 'react'
import sockbaseShared from 'shared'
import Alert from '../../../../components/Parts/Alert'
import Loading from '../../../../components/Parts/Loading'
import StepProgress from '../../../../components/Parts/StepProgress'
import useDayjs from '../../../../hooks/useDayjs'
import CheckAccount from './CheckAccount'
import Complete from './Complete'
import Confirm from './Confirm'
import Input from './Input'
import Introduction from './Introduction'
import Payment from './Payment'
import type { User } from 'firebase/auth'
import type { SockbaseAccount, SockbaseAccountSecure, SockbaseStoreDocument, SockbaseTicket, SockbaseTicketCreateResult } from 'sockbase'

const stepProgresses = ['説明', '入力', '確認', '決済', '完了']

interface Props {
  store: SockbaseStoreDocument | null | undefined
  user: User | null | undefined
  userData: SockbaseAccount | null | undefined
  loginAsync: (email: string, password: string) => Promise<void>
  logoutAsync: () => Promise<void>
  createUserAsync: (email: string, password: string) => Promise<User>
  updateUserDataAsync: (userId: string, userData: SockbaseAccount) => Promise<void>
  createTicketAsync: (ticket: SockbaseTicket) => Promise<SockbaseTicketCreateResult>
}
const StepContainer: React.FC<Props> = props => {
  const { formatByDate } = useDayjs()

  const [step, setStep] = useState(0)

  const [ticket, setTicket] = useState<SockbaseTicket>()
  const [userData, setUserData] = useState<SockbaseAccountSecure>()

  const [submitProgressPercent, setSubmitProgressPercent] = useState(0)
  const [addedResult, setAddedResult] = useState<SockbaseTicketCreateResult>()

  const selectedType = useMemo(() => {
    if (!props.store || !ticket) return
    return props.store.types.filter(t => t.id === ticket.typeId)[0]
  }, [props.store, ticket])

  const selectedPaymentMethod = useMemo(() => {
    if (!ticket) return
    return sockbaseShared.constants.payment.methods
      .filter(m => m.id === ticket.paymentMethod)[0]
  }, [ticket])

  const handleSubmitAsync = useCallback(async () => {
    if (!ticket) return

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

    await props.createTicketAsync(ticket)
      .then(async result => {
        setAddedResult(result)
        setSubmitProgressPercent(100)
        await (new Promise(resolve => setTimeout(resolve, 2000)))
      })
  }, [props.user, props.userData, ticket, userData])

  useEffect(() => window.scrollTo(0, 0), [step])

  const steps = useMemo(() => {
    if (!props.store) return
    return ([
      <CheckAccount
        key="checkAccount"
        loginAsync={props.loginAsync}
        logoutAsync={props.logoutAsync}
        nextStep={() => setStep(1)}
        user={props.user} />,
      <Introduction
        key="introduction"
        nextStep={() => setStep(2)}
        prevStep={() => setStep(0)}
        store={props.store} />,
      <Input
        fetchedUserData={props.userData}
        key="input"
        nextStep={(t, u) => {
          setTicket(t)
          setUserData(u)
          setStep(3)
        }}
        prevStep={() => setStep(1)}
        store={props.store}
        ticket={ticket}
        userData={userData} />,
      <Confirm
        fetchedUserData={props.userData}
        key="confirm"
        nextStep={() => setStep(4)}
        prevStep={() => setStep(2)}
        selectedPaymentMethod={selectedPaymentMethod}
        selectedType={selectedType}
        submitAsync={handleSubmitAsync}
        submitProgressPercent={submitProgressPercent}
        userData={userData} />,
      <Payment
        addedResult={addedResult}
        key="payment"
        nextStep={() => setStep(5)}
        selectedPaymentMethod={selectedPaymentMethod}
        selectedType={selectedType}
        store={props.store}
        ticket={ticket}
        user={props.user} />,
      <Complete
        addedResult={addedResult}
        key="complete" />
    ])
  }, [
    props.store,
    props.user,
    props.userData,
    ticket,
    userData,
    selectedType,
    selectedPaymentMethod,
    submitProgressPercent,
    addedResult
  ])

  const now = new Date().getTime()

  return (
    <>
      {props.store === undefined && (
        <Loading text="チケットストア情報" />
      )}

      {props.store === null && (
        <Alert
          title="チケットストアが見つかりません"
          type="error">
        指定された ID のチケットストアを見つけることができませんでした。<br />
        URL が正しく入力されていることを確認してください。
        </Alert>
      )}

      {props.store && (
        <>
          <h1>{props.store.name} 申し込み受付</h1>

          {now < props.store.schedules.startApplication && (
            <Alert
              title="受付期間前です"
              type="error">
          このチケットストアの申し込み受付は <b>{formatByDate(props.store.schedules.startApplication, 'YYYY年 M月 D日 H時mm分')}</b> から開始予定です。
            </Alert>
          )}

          {props.store.schedules.endApplication < now && (
            <Alert
              title="受付を終了しました"
              type="error">
          このチケットストアの申し込み受付は <b>{formatByDate(props.store.schedules.endApplication - 1, 'YYYY年 M月 D日')}</b> をもって終了しました。
            </Alert>
          )}

          {props.store.schedules.startApplication < now && now <= props.store.schedules.endApplication && (
            <>
              {props.store.descriptions.map((d, k) => <p key={k}>{d}</p>)}
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
