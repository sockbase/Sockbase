import { useEffect, useMemo, useState } from 'react'
import { type User } from 'firebase/auth'
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
  SockbaseApplicationDocument,
  SockbaseApplicationLinks,
  SockbaseEventDocument
} from 'sockbase'

const stepProgresses = ['説明', '入力', '確認', '決済', '完了']

interface Props {
  user: User | null | undefined
  userData: SockbaseAccount | null | undefined
  event: SockbaseEventDocument | null | undefined
  eyecatchURL: string | null | undefined
  pastApps: SockbaseApplicationDocument[] | undefined
  pastAppLinks: Record<string, SockbaseApplicationLinks | null> | undefined
  pastEvents: Record<string, SockbaseEventDocument> | undefined

}
const StepContainer: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()

  const [step, setStep] = useState(0)

  const [app, setApp] = useState<SockbaseApplication>()
  const [links, setLinks] = useState<SockbaseApplicationLinks>()
  const [userData, setUserData] = useState<SockbaseAccountSecure>()
  const [circleCutData, setCircleCutData] = useState<string>()
  const [circleCutFile, setCircleCutFile] = useState<File>()

  const steps = useMemo(() => {
    if (!props.event) return
    return ([
      <CheckAccount
        key="checkAccount"
        eyecatchURL={props.eyecatchURL}
        user={props.user}
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
        key="confirm" />,
      <Payment
        key="payment" />,
      <Complete
        key="complete" />
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
    circleCutData
  ])

  useEffect(() => window.scrollTo(0, 0), [step])

  const now = new Date().getTime()

  return (
    <>
      {props.event === null && <Alert title="イベントが見つかりません" type="danger">
        指定されたIDのイベントを見つけることができませんでした。<br />
        URLが正しく入力されていることを確認してください。
      </Alert>}
      {props.event && <>
        <h1>{props.event.eventName} サークル参加申し込み受付</h1>

        {props.event.schedules.endApplication < now && <Alert type="danger" title="参加受付は終了しました">
          このイベントのサークル参加申し込み受付は <b>{formatByDate(props.event.schedules.endApplication - 1, 'YYYY年 M月 D日')}</b> をもって終了しました。
        </Alert>}

        {props.event.descriptions.map((d, k) => <p key={k}>{d}</p>)}

        <StepProgress
          steps={stepProgresses.map((s, k) => ({
            text: s,
            isActive: k === step - 1
          }))} />

        {steps?.[step]}
      </>}
    </>
  )
}

export default StepContainer
