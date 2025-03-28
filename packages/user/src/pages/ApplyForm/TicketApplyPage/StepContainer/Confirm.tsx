import { useCallback, useState } from 'react'
import { MdArrowBack, MdArrowForward } from 'react-icons/md'
import FormButton from '../../../../components/Form/FormButton'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import Alert from '../../../../components/Parts/Alert'
import IconLabel from '../../../../components/Parts/IconLabel'
import LoadingCircleWrapper from '../../../../components/Parts/LoadingCircleWrapper'
import ProgressBar from '../../../../components/Parts/ProgressBar'
import UserDataView from '../../../../components/UserDataView'
import useError from '../../../../hooks/useError'
import AmountCalculator from '../../CircleApplyPage/StepContainer/AmountCalculator'
import type { SockbaseAccount, SockbaseAccountSecure, SockbaseStoreType, VoucherAppliedAmount } from 'sockbase'

interface Props {
  fetchedUserData: SockbaseAccount | null | undefined
  userData: SockbaseAccountSecure | undefined
  selectedType: SockbaseStoreType | undefined
  selectedPaymentMethod: { id: string, description: string } | undefined
  submitProgressPercent: number
  paymentAmount: VoucherAppliedAmount | null | undefined
  submitAsync: () => Promise<void>
  prevStep: () => void
  nextStep: () => void
}
const Confirm: React.FC<Props> = props => {
  const { convertErrorMessage } = useError()

  const [isProgress, setProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>()

  const handleSubmit = useCallback(() => {
    setProgress(true)
    setErrorMessage(null)
    props.submitAsync()
      .then(() => props.nextStep())
      .catch(err => {
        setErrorMessage(convertErrorMessage(err))
        setProgress(false)
        throw err
      })
  }, [])

  return (
    <>
      <h1>入力内容確認</h1>

      <UserDataView
        fetchedUserData={props.fetchedUserData}
        userData={props.userData} />

      {props.selectedType?.price && (
        <>
          <h2>お支払い情報</h2>

          <h3>選択された参加種別</h3>
          <table>
            <tbody>
              <tr>
                <th>チケット種別</th>
                <td>{props.selectedType.name}</td>
              </tr>
              <tr>
                <th>説明</th>
                <td>{props.selectedType.description}</td>
              </tr>
              <AmountCalculator paymentAmount={props.paymentAmount} />
            </tbody>
          </table>

          <h3>決済方法</h3>
          <p>
            {props.selectedPaymentMethod?.description}
          </p>
        </>
      )}

      <h1>申し込み情報送信</h1>
      <p>
        上記の内容で正しければ「決済に進む (申し込み情報送信)」ボタンを押してください。
      </p>
      <p>
        修正する場合は「修正」ボタンを押してください。
      </p>

      {errorMessage && (
        <Alert
          title="エラーが発生しました"
          type="error">
          {errorMessage}
        </Alert>
      )}

      <FormSection>
        <FormItem>
          <FormButton
            disabled={isProgress}
            onClick={props.prevStep}>
            <IconLabel
              icon={<MdArrowBack />}
              label="修正する" />
          </FormButton>
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem>
          <LoadingCircleWrapper
            inlined
            isLoading={isProgress}>
            <FormButton
              color="primary"
              disabled={isProgress}
              onClick={handleSubmit}>
              <IconLabel
                icon={<MdArrowForward />}
                label="決済に進む (申し込み情報送信)" />
            </FormButton>
          </LoadingCircleWrapper>
        </FormItem>
      </FormSection>

      {isProgress && (
        <>
          <ProgressBar percent={props.submitProgressPercent} />
          <Alert
            title="申し込み情報を送信中です"
            type="info">
          送信処理に時間がかかる場合がございます。<br />
          進捗率が 100% になるまでそのままでお待ちください。
          </Alert>
        </>
      )}
    </>
  )
}

export default Confirm
