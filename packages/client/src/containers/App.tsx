import { useState } from 'react'
import { ScrollRestoration, useNavigate } from 'react-router-dom'

import useFirebase from '../hooks/useFirebase'
import useFirebaseError from '../hooks/useFirebaseError'

import DefaultLayout from '../components/Layout/Default/Default'
import Login from '../components/pages/App/Login'

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
      <Login
        email={email}
        password={password}
        setEmail={email => setEmail(email)}
        setPassword={password => setPassword(password)}
        login={login}
        isProcessing={isProccesing}
        error={error} />

      <ScrollRestoration
        getKey={(location) => {
          return location.pathname
        }}
      />
    </DefaultLayout>)
}

export default App
