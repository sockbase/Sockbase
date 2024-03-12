import { useMemo, useState } from 'react'
import {
  type SockbaseAccountSecure,
  type SockbaseAccount,
  type SockbaseStoreDocument,
  type SockbaseTicketUserDocument
} from 'sockbase'
import FormButton from '../../../components/Form/Button'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import Alert from '../../../components/Parts/Alert'
import LoadingCircleWrapper from '../../../components/Parts/LoadingCircleWrapper'
import useFirebaseError from '../../../hooks/useFirebaseError'

interface Props {
  store: SockbaseStoreDocument
  ticketUser: SockbaseTicketUserDocument
  loggedInUserData: SockbaseAccount | null
  inputedUserData: SockbaseAccountSecure | undefined
  submitAssignTicket: () => Promise<void>
  nextStep: () => void
  prevStep: () => void
}
const Step2: React.FC<Props> = (props) => {
  const { localize } = useFirebaseError()

  const [isProgress, setProgress] = useState(false)
  const [error, setError] = useState<string>()

  const handleSubmit = (): void => {
    setProgress(true)
    props.submitAssignTicket()
      .then(() => props.nextStep())
      .catch(err => {
        setError(localize(err.message))
        setProgress(false)
      })
  }

  const typeName = useMemo(() => {
    if (!props.store || !props.ticketUser) return ''

    const type = props.store.types
      .filter(t => t.id === props.ticketUser.typeId)[0]
    return type.name
  }, [props.store, props.ticketUser])

  return (
    <>
      <h1>入力内容確認</h1>

      <h2>イベント情報</h2>
      <table>
        <tbody>
          <tr>
            <th>チケット名</th>
            <td>{props.store.storeName}</td>
          </tr>
          <tr>
            <th>参加種別</th>
            <td>{typeName}</td>
          </tr>
        </tbody>
      </table>

      <h2>使用者情報</h2>

      <table>
        <tbody>
          <tr>
            <th>メールアドレス</th>
            <td>{props.loggedInUserData?.email ?? props.inputedUserData?.email}</td>
          </tr>
          <tr>
            <th>氏名</th>
            <td>{props.loggedInUserData?.name ?? props.inputedUserData?.name}</td>
          </tr>
          <tr>
            <th>郵便番号</th>
            <td>{props.loggedInUserData?.postalCode ?? props.inputedUserData?.postalCode}</td>
          </tr>
          <tr>
            <th>住所</th>
            <td>{props.loggedInUserData?.address ?? props.inputedUserData?.address}</td>
          </tr>
          <tr>
            <th>電話番号</th>
            <td>{props.loggedInUserData?.telephone ?? props.inputedUserData?.telephone}</td>
          </tr>
        </tbody>
      </table>

      {error && <Alert type="danger" title="エラーが発生しました">
        {error}
      </Alert>}

      <FormSection>
        <FormItem>
          <FormButton onClick={() => props.prevStep()} color="default" disabled={isProgress}>修正する</FormButton>
        </FormItem>
        <FormItem>
          <LoadingCircleWrapper isLoading={isProgress}>
            <FormButton onClick={handleSubmit} disabled={isProgress}>チケットを受け取る</FormButton>
          </LoadingCircleWrapper>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Step2
