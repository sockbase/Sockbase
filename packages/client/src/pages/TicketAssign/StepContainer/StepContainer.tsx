import { useCallback, useEffect, useState } from 'react'
import {
  type SockbaseAccountSecure,
  type SockbaseAccount,
  type SockbaseStoreDocument,
  type SockbaseTicketUserDocument
} from 'sockbase'
import StepProgress from '../../../components/Parts/StepProgress'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import useStore from '../../../hooks/useStore'
import useFirebase from '../../../hooks/useFirebase'
import useUserData from '../../../hooks/useUserData'

const stepProgresses = ['入力', '確認', '完了']

interface Props {
  ticketHashId: string
  isLoggedIn: boolean
  store: SockbaseStoreDocument
  ticketUser: SockbaseTicketUserDocument
  userData: SockbaseAccount | null
}
const StepContainer: React.FC<Props> = (props) => {
  const { assignTicketUserAsync } = useStore()
  const { createUser, user } = useFirebase()
  const { updateUserDataAsync } = useUserData()

  const [step, setStep] = useState(0)
  const [stepComponents, setStepComponents] = useState<React.ReactNode[]>()

  const [userData, setUserData] = useState<SockbaseAccountSecure>()

  const submitAssignTicket = useCallback(async (): Promise<void> => {
    if (!userData || user === undefined) return

    if (user) {
      await assignTicketUserAsync(user.uid, props.ticketHashId)
      return
    }

    const newUser = await createUser(userData.email, userData.password)
    await updateUserDataAsync(newUser.uid, userData)
    await assignTicketUserAsync(newUser.uid, props.ticketHashId)
  }, [userData, user])

  const onInitialize = (): void => {
    setStepComponents([
      <Step1 key="step1"
        isLoggedIn={props.isLoggedIn}
        store={props.store}
        ticketUser={props.ticketUser}
        userData={userData}
        nextStep={(u) => {
          setUserData(u)
          setStep(1)
        }} />,
      <Step2 key="step2"
        store={props.store}
        ticketUser={props.ticketUser}
        loggedInUserData={props.userData}
        inputedUserData={userData}
        submitAssignTicket={submitAssignTicket}
        nextStep={() => setStep(2)}
        prevStep={() => setStep(0)} />,
      <Step3 key="step3"
        ticketHashId={props.ticketHashId}
        store={props.store}
        ticketUser={props.ticketUser} />
    ])
  }
  useEffect(onInitialize, [props.isLoggedIn, props.store, props.ticketUser, props.userData, userData])

  const onChangeStep: () => void =
    () => window.scrollTo(0, 0)
  useEffect(onChangeStep, [step])

  return (
    <>
      <h1>{props.store.storeName} 受け取りページ</h1>

      <StepProgress steps={
        stepProgresses.map((i, k) => ({
          text: i,
          isActive: k === step
        }))
      } />

      {stepComponents?.[step] ?? ''}
    </>
  )
}

export default StepContainer
