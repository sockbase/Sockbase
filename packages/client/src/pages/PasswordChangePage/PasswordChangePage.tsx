import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import Alert from '../../components/Parts/Alert'
import LinkButton from '../../components/Parts/LinkButton'
import useFirebase from '../../hooks/useFirebase'
import useFirebaseError from '../../hooks/useFirebaseError'
import DefaultBaseLayout from '../../layouts/DefaultBaseLayout/DefaultBaseLayout'
import PasswordInputForm from './PasswordInputForm'

const PasswordChangePage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const {
    verifyPasswordResetCodeAsync,
    confirmPasswordResetAsync
  } = useFirebase()
  const { localize } = useFirebaseError()

  const [oobCode, setOOBCode] = useState<string | null>()

  const [errorMessage, setErrorMessage] = useState<string>()

  useEffect(() => {
    const paramOOBCode = searchParams.get('oobCode')
    if (!paramOOBCode) {
      setErrorMessage('URLが間違っています')
      return
    }
    verifyPasswordResetCodeAsync(paramOOBCode)
      .then(() => setOOBCode(paramOOBCode))
      .catch(err => {
        setErrorMessage('不正なトークンが入力されました')
        throw err
      })
  }, [searchParams])

  const handleSubmitAsync = useCallback(async (password: string) => {
    if (!oobCode) return
    await confirmPasswordResetAsync(oobCode, password)
      .then(() => setOOBCode(null))
      .catch(err => {
        setErrorMessage(localize(err.message))
        throw err
      })
  }, [oobCode])

  return (
    <DefaultBaseLayout title="パスワード変更">
      <h1>パスワード変更</h1>

      {errorMessage && <Alert title="エラーが発生しました" type="danger">
        {errorMessage}
      </Alert>}

      {oobCode === null && <>
        <Alert title="パスワードを変更しました" type="success">
          次回からは新しいパスワードでログインしてください。
        </Alert>
        <FormSection>
          <FormItem>
            <LinkButton to="/">ログイン画面へ進む</LinkButton>
          </FormItem>
        </FormSection>
      </>}

      {oobCode && <PasswordInputForm
        submitAsync={handleSubmitAsync} />}
    </DefaultBaseLayout>
  )
}

export default PasswordChangePage
