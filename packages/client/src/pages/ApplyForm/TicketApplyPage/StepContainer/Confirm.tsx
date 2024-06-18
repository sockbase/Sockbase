import { useCallback, useState } from 'react'
import FormButton from '../../../../components/Form/Button'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import Alert from '../../../../components/Parts/Alert'
import LoadingCircleWrapper from '../../../../components/Parts/LoadingCircleWrapper'
import ProgressBar from '../../../../components/Parts/ProgressBar'
import UserDataView from '../../../../components/UserDataView'
import useFirebaseError from '../../../../hooks/useFirebaseError'
import type { SockbaseAccount, SockbaseAccountSecure, SockbaseStoreType } from 'sockbase'

interface Props {
  fetchedUserData: SockbaseAccount | null | undefined
  userData: SockbaseAccountSecure | undefined
  selectedType: SockbaseStoreType | undefined
  selectedPaymentMethod: { id: string, description: string } | undefined
  submitProgressPercent: number
  submitAsync: () => Promise<void>
  prevStep: () => void
  nextStep: () => void
}
const Confirm: React.FC<Props> = (props) => {
  const { localize } = useFirebaseError()

  const [isProgress, setProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>()

  const handleSubmit = useCallback(() => {
    setProgress(true)
    setErrorMessage(null)
    props.submitAsync()
      .then(() => props.nextStep())
      .catch(err => {
        setErrorMessage(localize(err.message))
        setProgress(false)
        throw err
      })
  }, [])

  return (
    <>
      <h1>入力内容確認</h1>

      {props.selectedType?.productInfo && <>
        <h2>参加費</h2>
        <h3>選択された参加種別</h3>
        <table>
          <tbody>
            <tr>
              <th>参加種別</th>
              <td>{props.selectedType.name}</td>
            </tr>
            <tr>
              <th>詳細</th>
              <td>{props.selectedType.description}</td>
            </tr>
            <tr>
              <th>参加費</th>
              <td>{props.selectedType.price.toLocaleString()}円</td>
            </tr>
          </tbody>
        </table>

        <h3>決済方法</h3>
        <p>
          {props.selectedPaymentMethod?.description}
        </p>
      </>}

      <UserDataView
        fetchedUserData={props.fetchedUserData}
        userData={props.userData} />

      <h1>申し込み情報送信</h1>
      <p>
        上記の内容で正しければ「決済に進む(申し込み情報送信)」ボタンを押してください。
      </p>
      <p>
        修正する場合は「修正」ボタンを押してください。
      </p>

      {errorMessage && <Alert type="danger" title="エラーが発生しました">
        {errorMessage}
      </Alert>}

      <FormSection>
        <FormItem>
          <FormButton
            color="default"
            onClick={props.prevStep}
            disabled={isProgress}>
            修正する
          </FormButton>
        </FormItem>
        <FormItem>
          <LoadingCircleWrapper isLoading={isProgress}>
            <FormButton
              onClick={handleSubmit}
              disabled={isProgress}>
              決済に進む(申し込み情報送信)
            </FormButton>
          </LoadingCircleWrapper>
        </FormItem>
      </FormSection>

      {isProgress && <>
        <ProgressBar percent={props.submitProgressPercent}/>
        <Alert>
          送信処理に時間がかかる場合がございます。<br />
          進捗率が100%になるまでそのままでお待ちください。
        </Alert>
      </>}
    </>
  )
}

export default Confirm
