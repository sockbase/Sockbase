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
import useDayjs from '../../../hooks/useDayjs'
import useFirebaseError from '../../../hooks/useFirebaseError'

interface Props {
  store: SockbaseStoreDocument
  ticketUser: SockbaseTicketUserDocument
  fetchedUserData: SockbaseAccount | null
  userData: SockbaseAccountSecure | undefined
  submitAssignTicket: () => Promise<void>
  nextStep: () => void
  prevStep: () => void
}
const Step2: React.FC<Props> = (props) => {
  const { localize } = useFirebaseError()
  const { formatByDate } = useDayjs()

  const [isProgress, setProgress] = useState(false)
  const [error, setError] = useState<string>()

  const typeName = useMemo(() => {
    if (!props.store || !props.ticketUser) return ''

    const type = props.store.types
      .filter(t => t.id === props.ticketUser.typeId)[0]
    return type.name
  }, [props.store, props.ticketUser])

  const displayGender = useMemo(() => {
    const genderCode = props.fetchedUserData?.gender ?? props.userData?.gender
    if (genderCode === 1) {
      return '男性'
    } else if (genderCode === 2) {
      return '女性'
    } else {
      return ''
    }
  }, [props.fetchedUserData, props.userData])

  const handleSubmit = (): void => {
    setProgress(true)
    props.submitAssignTicket()
      .then(() => props.nextStep())
      .catch(err => {
        setError(localize(err.message))
        setProgress(false)
      })
  }

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
            <td>{props.fetchedUserData?.email ?? props.userData?.email}</td>
          </tr>
          <tr>
            <th>氏名</th>
            <td>{props.fetchedUserData?.name ?? props.userData?.name}</td>
          </tr>
          <tr>
            <th>生年月日</th>
            <td>{formatByDate(props.fetchedUserData?.birthday ?? props.userData?.birthday, 'YYYY年 M月 D日')}</td>
          </tr>
          <tr>
            <th>性別</th>
            <td>{displayGender}</td>
          </tr>
          <tr>
            <th>郵便番号</th>
            <td>{props.fetchedUserData?.postalCode ?? props.userData?.postalCode}</td>
          </tr>
          <tr>
            <th>住所</th>
            <td>{props.fetchedUserData?.address ?? props.userData?.address}</td>
          </tr>
          <tr>
            <th>電話番号</th>
            <td>{props.fetchedUserData?.telephone ?? props.userData?.telephone}</td>
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
