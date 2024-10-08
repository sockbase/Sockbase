import { useCallback, useMemo, useState } from 'react'
import useFirebase from '../hooks/useFirebase'
import useFirebaseError from '../hooks/useFirebaseError'
import useValidate from '../hooks/useValidate'
import FormButton from './Form/Button'
import FormItem from './Form/FormItem'
import FormSection from './Form/FormSection'
import FormInput from './Form/Input'
import FormLabel from './Form/Label'
import Alert from './Parts/Alert'
import LinkButton from './Parts/LinkButton'

const LoginForm: React.FC = () => {
  const validator = useValidate()
  const { loginByEmailAsync } = useFirebase()
  const { localize } = useFirebaseError()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isProgress, setProgress] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const errorCount = useMemo((): number => {
    const validators = [
      validator.isEmail(email),
      !validator.isEmpty(password)
    ]
    return validators.filter(v => !v).length
  }, [email, password])

  const handleLogin = useCallback(() => {
    if (!email || !password) return
    setProgress(true)
    loginByEmailAsync(email, password)
      .catch(err => {
        setError(localize(err.message))
        setProgress(false)
        throw err
      })
  }, [email, password])

  return (
    <>
      <FormSection>
        <FormItem>
          <FormLabel>メールアドレス</FormLabel>
          <FormInput
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={isProgress} />
        </FormItem>
        <FormItem>
          <FormLabel>パスワード</FormLabel>
          <FormInput
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin}
            disabled={isProgress}/>
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem>
          <FormButton
            onClick={handleLogin}
            disabled={isProgress || errorCount > 0}>
              ログイン
          </FormButton>
        </FormItem>
        <FormItem>
          <LinkButton
            color="default"
            to="/reset-password"
            disabled={isProgress}>
              パスワードを忘れた場合
          </LinkButton>
        </FormItem>
        {error && <FormItem>
          <Alert title="エラーが発生しました" type="error">
            {error}
          </Alert>
        </FormItem>}
      </FormSection>
    </>
  )
}

export default LoginForm
