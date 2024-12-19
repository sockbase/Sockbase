import { useCallback, useMemo, useState } from 'react'
import { MdLogin, MdQuestionMark } from 'react-icons/md'
import useError from '../hooks/useError'
import useFirebase from '../hooks/useFirebase'
import useValidate from '../hooks/useValidate'
import FormButton from './Form/FormButton'
import FormInput from './Form/FormInput'
import FormItem from './Form/FormItem'
import FormLabel from './Form/FormLabel'
import FormSection from './Form/FormSection'
import Alert from './Parts/Alert'
import IconLabel from './Parts/IconLabel'
import LinkButton from './Parts/LinkButton'

const LoginForm: React.FC = () => {
  const validator = useValidate()
  const { loginByEmailAsync } = useFirebase()
  const { convertErrorMessage } = useError()

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
        setError(convertErrorMessage(err))
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
            disabled={isProgress}
            onChange={e => setEmail(e.target.value)}
            type="email"
            value={email} />
        </FormItem>
        <FormItem>
          <FormLabel>パスワード</FormLabel>
          <FormInput
            disabled={isProgress}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin}
            type="password"
            value={password} />
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem $inlined>
          <FormButton
            color="primary"
            disabled={isProgress || errorCount > 0}
            onClick={handleLogin}>
            <IconLabel
              icon={<MdLogin />}
              label="ログイン" />
          </FormButton>
          <LinkButton
            disabled={isProgress}
            to="/reset-password">
            <IconLabel
              icon={<MdQuestionMark />}
              label="パスワードを忘れた場合" />
          </LinkButton>
        </FormItem>
        {error && (
          <FormItem>
            <Alert
              title="エラーが発生しました"
              type="error">
              {error}
            </Alert>
          </FormItem>
        )}
      </FormSection>
    </>
  )
}

export default LoginForm
