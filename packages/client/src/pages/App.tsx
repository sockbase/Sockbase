import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useFirebase from '../hooks/useFirebase'
import useFirebaseError from '../hooks/useFirebaseError'

import DefaultLayout from '../components/Layout/Default/Default'
import Login from '../components/pages/App/Login'
import LinkButton from '../components/Parts/LinkButton'
import FormSection from '../components/Form/FormSection'
import FormItem from '../components/Form/FormItem'
import Loading from '../components/Parts/Loading'

export interface User {
  userId: string
  email?: string | null
}

const App: React.FC = () => {
  const navigate = useNavigate()
  const firebase = useFirebase()
  const { localize: localizeFirebaseError } = useFirebaseError()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isProccesing, setProcessing] = useState(false)
  const [error, setError] = useState<{ title: string, content: string } | null>()

  const login: () => void =
    () => {
      setProcessing(true)
      setError(null)

      firebase.loginByEmail(email, password)
        .then(() => navigate('/dashboard'))
        .catch((e: Error) => {
          const message = localizeFirebaseError(e.message)
          setError({ title: 'ログインに失敗しました', content: message })
          throw e
        })
        .finally(() => {
          setProcessing(false)
        })
    }

  return (
    <DefaultLayout>
      {firebase.user === undefined
        ? <Loading text='認証情報' />
        : firebase.user === null
          ?
          <Login
            email={email}
            password={password}
            setEmail={email => setEmail(email)}
            setPassword={password => setPassword(password)}
            login={login}
            isProcessing={isProccesing}
            error={error} />
          : <FormSection>
            <FormItem>
              <LinkButton to="/dashboard" color="default">マイページに進む</LinkButton>
            </FormItem>
          </FormSection>
      }

      <h2>Sockbaseとは？</h2>
      <h3>イベントへの申し込み方法</h3>
      <p>
        イベント主催者から提供されたURLを使用してください。
      </p>
    </DefaultLayout>)
}

export default App
