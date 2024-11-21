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
import useFirebase from '../../hooks/useFirebase'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'

const LoginPage: React.FC = () => {
  const { loginByEmailAsync } = useFirebase()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isProgress, setIsProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState(false)

  const handleLogin = useCallback(() => {
    if (!email || !password) return
    setIsProgress(true)
    setErrorMessage(false)
    loginByEmailAsync(email, password)
      .catch(err => {
        setIsProgress(false)
        setErrorMessage(true)
        throw err
      })
  }, [email, password])

  return (
    <DefaultLayout title='ログイン'>
      <PageTitle
        icon={<MdLogin />}
        title="ログイン" />
      <FormSection>
        <FormItem>
          <FormLabel>メールアドレス</FormLabel>
          <FormInput
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
            disabled={isProgress} />
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem>
          <FormButton
            type="submit"
            onClick={handleLogin}
            disabled={isProgress}>
            <IconLabel icon={<MdLogin />} label="ログイン" />
          </FormButton>
        </FormItem>
      </FormSection>
      {errorMessage && (
        <Alert type="error" title="エラーが発生しました" />
      )}
    </DefaultLayout>
  )
}

export default LoginPage
