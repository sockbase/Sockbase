import { useMemo, useState } from 'react'
import sockbaseShared from 'shared'
import { type SockbaseStoreType, type SockbaseAccountSecure, type SockbaseTicket, type SockbaseStoreDocument, type SockbaseAccount } from 'sockbase'
import FormButton from '../../../components/Form/Button'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import Alert from '../../../components/Parts/Alert'
import LoadingCircleWrapper from '../../../components/Parts/LoadingCircleWrapper'
import ProgressBar from '../../../components/Parts/ProgressBar'
import useDayjs from '../../../hooks/useDayjs'
import useFirebaseError from '../../../hooks/useFirebaseError'

interface Props {
  store: SockbaseStoreDocument
  ticketInfo: SockbaseTicket | undefined
  userData: SockbaseAccountSecure | undefined
  fetchedUserData: SockbaseAccount | null
  isLoggedIn: boolean
  submitProgressPercent: number
  submitTicket: () => Promise<void>
  prevStep: () => void
  nextStep: () => void
}
const Step2: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()
  const { localize } = useFirebaseError()

  const [isProgressing, setProgressing] = useState(false)
  const [error, setError] = useState<string | null>()

  const selectedType = useMemo((): SockbaseStoreType | null => {
    if (!props.store || !props.ticketInfo) return null
    return props.store.types
      .filter(t => t.id === props.ticketInfo?.typeId)[0]
  }, [props.store, props.ticketInfo])

  const selectedPaymentMethod = useMemo((): string => {
    if (!props.ticketInfo?.paymentMethod) return ''
    return sockbaseShared.constants.payment.methods
      .filter(p => p.id === props.ticketInfo?.paymentMethod)[0].description
  }, [props.ticketInfo])

  const handleSubmit = (): void => {
    setProgressing(true)

    props.submitTicket()
      .then(() => props.nextStep())
      .catch((err: Error) => {
        setError(localize(err.message))
        setProgressing(false)
      })
  }

  return (
    <>
      <h1>入力内容確認</h1>

      <h2>申し込み責任者情報</h2>

      <table>
        <tbody>
          <tr>
            <th>氏名</th>
            <td>{props.fetchedUserData?.name ?? props.userData?.name}</td>
          </tr>
          <tr>
            <th>生年月日</th>
            <td>{formatByDate(props.fetchedUserData?.birthday ?? props.userData?.birthday, 'YYYY年 M月 D日')}</td>
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

      {selectedType?.productInfo && <>
        <h2>参加費</h2>
        <h3>選択された参加種別</h3>
        <table>
          <tbody>
            <tr>
              <th>参加種別</th>
              <td>{selectedType.name}</td>
            </tr>
            <tr>
              <th>詳細</th>
              <td>{selectedType.description}</td>
            </tr>
            <tr>
              <th>参加費</th>
              <td>{selectedType.price.toLocaleString()}円</td>
            </tr>
          </tbody>
        </table>

        <h3>決済方法</h3>
        <p>
          {selectedPaymentMethod}
        </p>
      </>}

      <h2>Sockbaseログイン情報</h2>
      <table>
        <tbody>
          <tr>
            <th>メールアドレス</th>
            <td>{props.fetchedUserData?.email ?? props.userData?.email}</td>
          </tr>
          <tr>
            <th>パスワード</th>
            <td>セキュリティ保護のため非表示</td>
          </tr>
        </tbody>
      </table>

      <h1>申し込み情報送信</h1>
      <p>
        上記の内容で正しければ「決済に進む(申し込み情報送信)」ボタンを押してください。
      </p>
      <p>
        修正する場合は「修正」ボタンを押してください。
      </p>

      {error && <Alert type="danger" title="エラーが発生しました">
        {error}
      </Alert>}

      <FormSection>
        <FormItem>
          <FormButton color="default" onClick={() => props.prevStep()} disabled={isProgressing}>修正する</FormButton>
        </FormItem>
        <FormItem>
          <LoadingCircleWrapper isLoading={isProgressing}>
            <FormButton onClick={handleSubmit} disabled={isProgressing}>決済に進む(申し込み情報送信)</FormButton>
          </LoadingCircleWrapper>
        </FormItem>
      </FormSection>

      {isProgressing && <>
        <ProgressBar percent={props.submitProgressPercent}/>
        <Alert>
          送信処理に時間がかかる場合がございます。<br />
          進捗率が100%になるまでそのままでお待ちください。
        </Alert>
      </>}
    </>
  )
}

export default Step2
