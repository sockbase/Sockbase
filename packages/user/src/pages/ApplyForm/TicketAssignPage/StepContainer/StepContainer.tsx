import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdBookOnline } from 'react-icons/md'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import Alert from '../../../../components/Parts/Alert'
import IconLabel from '../../../../components/Parts/IconLabel'
import LinkButton from '../../../../components/Parts/LinkButton'
import CheckAccount from '../../TicketApplyPage/StepContainer/CheckAccount'
import Complete from './Complete'
import Confirm from './Confirm'
import Input from './Input'
import type { User } from 'firebase/auth'
import type {
  SockbaseAccount,
  SockbaseAccountSecure,
  SockbaseStoreDocument,
  SockbaseTicketUserDocument
} from 'sockbase'

interface Props {
  store: SockbaseStoreDocument
  ticketHashId: string
  ticketUser: SockbaseTicketUserDocument
  user: User | null | undefined
  userData: SockbaseAccount | null | undefined
  loginAsync: (email: string, password: string) => Promise<void>
  logoutAsync: () => Promise<void>
  createUserAsync: (email: string, password: string) => Promise<User>
  updateUserDataAsync: (userId: string, userData: SockbaseAccount) => Promise<void>
  updateUserDataWithStoreIdAsync: (userId: string, storeId: string, userData: SockbaseAccount) => Promise<void>
  assignTicketUserAsync: (userId: string, ticketHashId: string) => Promise<void>
}
const StepContainer: React.FC<Props> = props => {
  const [step, setStep] = useState(0)

  const [userData, setUserData] = useState<SockbaseAccountSecure>()

  const selectedType = useMemo(() => {
    return props.store.types
      .filter(t => t.id === props.ticketUser.typeId)[0]
  }, [props.store, props.ticketUser])

  const handleSubmitAsync = useCallback(async () => {
    if (!userData) return

    if (!props.user) {
      if (!userData) {
        throw new Error('userData not provided')
      }
      const newUser = await props.createUserAsync(userData.email, userData.password)
      await props.updateUserDataAsync(newUser.uid, userData)
      await props.assignTicketUserAsync(newUser.uid, props.ticketHashId)
      await props.updateUserDataWithStoreIdAsync(newUser.uid, props.store.id, userData)
      return
    }

    if (props.userData && !props.userData?.gender) {
      const newUserData: SockbaseAccount = {
        ...props.userData,
        gender: userData?.gender
      }
      await props.updateUserDataAsync(props.user.uid, newUserData)
      await props.updateUserDataWithStoreIdAsync(props.user.uid, props.store.id, newUserData)
    }
    await props.assignTicketUserAsync(props.user.uid, props.ticketHashId)
  }, [props.user, props.userData, props.ticketHashId, userData])

  useEffect(() => window.scrollTo(0, 0), [step])

  const steps = useMemo(() => {
    return ([
      <CheckAccount
        key="checkAccount"
        loginAsync={props.loginAsync}
        logoutAsync={props.logoutAsync}
        nextStep={() => setStep(1)}
        user={props.user} />,
      <Input
        fetchedUserData={props.userData}
        key="input"
        nextStep={u => {
          setUserData(u)
          setStep(2)
        }}
        prevStep={() => setStep(0)}
        selectedType={selectedType}
        store={props.store}
        userData={userData} />,
      <Confirm
        fetchedUserData={props.userData}
        key="confirm"
        nextStep={() => setStep(3)}
        prevStep={() => setStep(1)}
        selectedType={selectedType}
        store={props.store}
        submitAsync={handleSubmitAsync}
        userData={userData} />,
      <Complete
        key="complete"
        selectedType={selectedType}
        store={props.store}
        ticketHashId={props.ticketHashId} />
    ])
  }, [props.user, props.store, props.userData, selectedType, userData])

  return (
    <>
      {props.ticketUser.usableUserId && (
        <>
          <Alert
            title="受け取り済みのチケットです"
            type="error">
          このチケットは既に受け取り済みです。
          </Alert>
          {props.user?.uid === props.ticketUser.usableUserId && (
            <FormSection>
              <FormItem>
                <LinkButton
                  color="primary"
                  to={`/tickets/${props.ticketHashId}`}>
                  <IconLabel
                    icon={<MdBookOnline />}
                    label="チケットを開く" />
                </LinkButton>
              </FormItem>
            </FormSection>
          )}
        </>
      )}

      {!props.ticketUser.usableUserId && (
        <>
          <h1>{props.store.name} チケット受け取りページ</h1>
          {steps?.[step]}
        </>
      )}
    </>
  )
}

export default StepContainer
