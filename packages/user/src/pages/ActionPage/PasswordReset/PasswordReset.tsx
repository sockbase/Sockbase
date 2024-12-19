import { useCallback, useEffect, useState } from 'react'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import Alert from '../../../components/Parts/Alert'
import LinkButton from '../../../components/Parts/LinkButton'
import useError from '../../../hooks/useError'
import useFirebase from '../../../hooks/useFirebase'
import PasswordInputForm from './PasswordInputForm'

interface Props {
  oobCode: string
}
const PasswordReset: React.FC<Props> = props => {
  const { verifyPasswordResetCodeAsync, confirmPasswordResetAsync } = useFirebase()
  const { convertErrorMessage } = useError()

  const [errorMessage, setErrorMessage] = useState<string | null>()
  const [isReady, setReady] = useState(false)
  const [isChangedPassword, setChangedPassword] = useState(false)

  useEffect(() => {
    verifyPasswordResetCodeAsync(props.oobCode)
      .then(() => setReady(true))
      .catch(err => {
        setErrorMessage(convertErrorMessage(err))
        throw err
      })
  }, [props.oobCode])

  const handleSubmitAsync = useCallback(async (password: string) => {
    await confirmPasswordResetAsync(props.oobCode, password)
      .then(() => setChangedPassword(true))
      .catch(err => {
        setErrorMessage(convertErrorMessage(err))
        throw err
      })
  }, [props.oobCode])

  return (
    <>
      {errorMessage && (
        <Alert
          title="エラーが発生しました"
          type="error">
          {errorMessage}
        </Alert>
      )}

      {isReady && !isChangedPassword && (
        <PasswordInputForm
          submitAsync={handleSubmitAsync} />
      )}

      {isChangedPassword && (
        <>
          <Alert
            title="パスワードを変更しました"
            type="success">
            次回からは新しいパスワードでログインしてください。
          </Alert>
          <FormSection>
            <FormItem>
              <LinkButton to="/">ログイン画面へ進む</LinkButton>
            </FormItem>
          </FormSection>
        </>
      )}
    </>
  )
}

export default PasswordReset
