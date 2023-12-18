import { MdLogin } from 'react-icons/md'
import useFirebase from '../../hooks/useFirebase'
import MainLayout from '../../components/Layouts/MainLayout/MainLayout'
import FormSection from '../../components/Form/FormSection'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/FormLabel'
import FormInput from '../../components/Form/FormInput'
import FormButton from '../../components/Form/FormButton'
import { useCallback, useMemo, useState } from 'react'
import useNotification from '../../hooks/useNotification'
import { useNavigate } from 'react-router-dom'
import useValidate from '../../hooks/useValidate'

const LoginPage: React.FC = () => {
  const { loginByEmail } = useFirebase()
  const validator = useValidate()
  const { addNotification } = useNotification()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isProgress, setProgress] = useState(false)

  const handleLogin = useCallback(() => {
    if (!email || !password) return
    setProgress(true)
    loginByEmail(email, password)
      .then(() => {
        addNotification('ログインしました')
        navigate('/')
      })
      .catch(() => {
        alert('ログインに失敗しました')
        setProgress(false)
      })
  }, [loginByEmail])

  const errorCount = useMemo((): number => {
    const validators = [validator.isEmail(email), !validator.isEmpty(password)]
    return validators.filter((v) => !v).length
  }, [email, password])

  return (
    <MainLayout
      title="ログイン"
      subTitle="Sockbase アカウントでログイン"
      icon={<MdLogin />}
    >
      <FormSection>
        <FormItem>
          <FormLabel>メールアドレス</FormLabel>
          <FormInput
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormItem>
        <FormItem>
          <FormLabel>パスワード</FormLabel>
          <FormInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormItem>
      </FormSection>
      <FormSection>
        <FormButton
          onClick={handleLogin}
          disabled={errorCount !== 0 || isProgress}
        >
          ログイン
        </FormButton>
      </FormSection>
    </MainLayout>
  )
}

export default LoginPage
