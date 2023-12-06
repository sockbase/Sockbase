import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import useValidate from '../../hooks/useValidate'
import useFirebase from '../../hooks/useFirebase'
import useFirebaseError from '../../hooks/useFirebaseError'
import DefaultBaseLayout from '../../components/Layout/DefaultBaseLayout/DefaultBaseLayout'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import FormSection from '../../components/Form/FormSection'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/Label'
import FormInput from '../../components/Form/Input'
import FormButton from '../../components/Form/Button'
import Alert from '../../components/Parts/Alert'
import LinkButton from '../../components/Parts/LinkButton'

const PasswordResetPage: React.FC = () => {
  const validator = useValidate()
  const { localize } = useFirebaseError()
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
        setErrorMessage(localize(err.message))
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
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="sumire@sockbase.net"
            hasError={!validator.isEmpty(email) && !validator.isEmail(email)}
            disabled={isProgress} />
        </FormItem>
      </FormSection>

      {!!errorCount && <Alert type="danger">
        {errorCount}件の入力項目に不備があります。
      </Alert>}

      <FormSection>
        <FormItem>
          <FormButton onClick={handleSubmit} disabled={isProgress || !!errorCount}>パスワードリセットURLを送付</FormButton>
        </FormItem>
      </FormSection>

      {isSuccess && <>
        <Alert type="success" title="リセットURLを送付しました">
          入力したメールアドレス宛にリセットURLを送付しました。<br />
          メールボックスをご確認ください。
        </Alert>
        <FormSection>
          <FormItem>
            <LinkButton to="/">ログイン画面へ進む</LinkButton>
          </FormItem>
        </FormSection>
      </>}

      {errorMessage && <Alert type="danger" title="エラーが発生しました">
        {errorMessage}
      </Alert>}
    </DefaultBaseLayout>
  )
}

export default PasswordResetPage
