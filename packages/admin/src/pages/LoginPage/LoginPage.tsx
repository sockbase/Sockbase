import { useCallback, useState } from 'react'
import { MdLogin } from 'react-icons/md'
import FormButton from '../../components/Form/FormButton'
import FormInput from '../../components/Form/FormInput'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/FormLabel'
import FormSection from '../../components/Form/FormSection'
import Alert from '../../components/Parts/Alert'
import IconLabel from '../../components/Parts/IconLabel'
import PageTitle from '../../components/Parts/PageTitle'
import useError from '../../hooks/useError'
import useFirebase from '../../hooks/useFirebase'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const LoginPage: React.FC = () => {
  const { loginByEmailAsync } = useFirebase()
  const { convertErrorMessage } = useError()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isProgress, setIsProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>()

  const handleLogin = useCallback(() => {
    if (!email || !password) return
    setIsProgress(true)
    setErrorMessage(null)
    loginByEmailAsync(email, password)
      .catch(err => {
        setIsProgress(false)
        setErrorMessage(convertErrorMessage(err))
        throw err
      })
  }, [email, password])

  return (
    <DefaultLayout title="ログイン">
      <PageTitle
        icon={<MdLogin />}
        title="ログイン" />
      <FormSection>
        <FormItem>
          <FormLabel>メールアドレス</FormLabel>
          <FormInput
            disabled={isProgress}
            onChange={e => setEmail(e.target.value)}
            value={email} />
        </FormItem>
        <FormItem>
          <FormLabel>パスワード</FormLabel>
          <FormInput
            disabled={isProgress}
            onChange={e => setPassword(e.target.value)}
            type="password"
            value={password} />
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem>
          <FormButton
            disabled={isProgress}
            onClick={handleLogin}
            type="submit">
            <IconLabel
              icon={<MdLogin />}
              label="ログイン" />
          </FormButton>
        </FormItem>
      </FormSection>
      {errorMessage && (
        <Alert
          title="エラーが発生しました"
          type="error">
          {errorMessage}
        </Alert>
      )}
    </DefaultLayout>
  )
}

export default LoginPage
