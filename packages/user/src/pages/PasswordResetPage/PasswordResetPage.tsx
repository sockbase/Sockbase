import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FormButton from '../../components/Form/FormButton'
import FormInput from '../../components/Form/FormInput'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/FormLabel'
import FormSection from '../../components/Form/FormSection'
import Alert from '../../components/Parts/Alert'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import useError from '../../hooks/useError'
import useFirebase from '../../hooks/useFirebase'
import useValidate from '../../hooks/useValidate'
import DefaultBaseLayout from '../../layouts/DefaultBaseLayout/DefaultBaseLayout'

const PasswordResetPage: React.FC = () => {
  const validator = useValidate()
  const { convertErrorMessage } = useError()
  const { sendPasswordResetURLAsync } = useFirebase()

  const [email, setEmail] = useState('')
  const [isProgress, setProgress] = useState(false)
  const [isSuccess, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = (): void => {
    if (errorCount > 0) return

    setErrorMessage('')
    setSuccess(false)
    setProgress(true)

    sendPasswordResetURLAsync(email)
      .then(() => setSuccess(true))
      .catch((err: Error) => {
        setErrorMessage(convertErrorMessage(err))
        setProgress(false)
      })
  }

  const errorCount = useMemo(() => {
    const validators = [
      !validator.isEmpty(email) && validator.isEmail(email)
    ]
    return validators.filter(v => !v).length
  }, [validator, email])

  return (
    <DefaultBaseLayout title="パスワード再設定">
      <Breadcrumbs>
        <li><Link to="/">Sockbaseトップ</Link></li>
      </Breadcrumbs>

      <h1>パスワード再設定</h1>

      <p>
        パスワードの再設定を行います。<br />
        登録したメールアドレスを入力してください。
      </p>

      <FormSection>
        <FormItem>
          <FormLabel>メールアドレス</FormLabel>
          <FormInput
            disabled={isProgress}
            hasError={!validator.isEmpty(email) && !validator.isEmail(email)}
            onChange={e => setEmail(e.target.value)}
            placeholder="sumire@sockbase.net"
            type="email"
            value={email} />
        </FormItem>
      </FormSection>

      {errorCount > 0 && (
        <Alert
          title={`${errorCount} 件の入力項目に不備があります。`}
          type="error" />
      )}

      <FormSection>
        <FormItem>
          <FormButton
            disabled={isProgress || !!errorCount}
            onClick={handleSubmit}>パスワードリセット URL を送付
          </FormButton>
        </FormItem>
      </FormSection>

      {isSuccess && (
        <Alert
          title="リセット URL を送付しました"
          type="success">
        入力したメールアドレス宛にリセットURLを送付しました。<br />
        メールボックスをご確認ください。
        </Alert>
      )}

      {errorMessage && (
        <Alert
          title="エラーが発生しました"
          type="error">{errorMessage}
        </Alert>
      )}
    </DefaultBaseLayout>
  )
}

export default PasswordResetPage
