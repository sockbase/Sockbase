import { useEffect, useState } from 'react'

import useFirebase from '../hooks/useFirebase'
import useFirebaseError from '../hooks/useFirebaseError'

import DefaultLayout from '../components/Layout/Default/Default'
import LoginSandboxComponent from '../components/pages/App/LoginSandbox'

export interface User {
  userId: string
  email?: string | null
}

const App: React.FC = () => {
  const firebase = useFirebase()
  const { parse: firebaseErrorParse } = useFirebaseError()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isProccesing, setProcessing] = useState(false)
  const [error, setError] = useState<{ title: string, content: string } | undefined>()

  const [user, setUser] = useState<User | undefined>()
  const [isLoggedIn, setLoggedIn] = useState<boolean | undefined>()

  const login: () => void =
    () => {
      setProcessing(true)
      setError(undefined)

      firebase.loginByEmail(email, password)
        .catch((e: Error) => {
          const message = firebaseErrorParse(e.message)
          setError({ title: 'ログインに失敗しました', content: message })
          throw e
        })
        .finally(() => {
          setProcessing(false)
        })
    }
  const logout: () => void =
    () => {
      setProcessing(true)
      setError(undefined)

      firebase.logout()
        .catch((e: Error) => {
          const message = firebaseErrorParse(e.message)
          setError({ title: 'ログアウトに失敗しました', content: message })
          throw e
        })
        .finally(() => {
          setProcessing(false)
        })
    }
  const onChangeLoggedInState: () => void =
    () => {
      if (!firebase.user) {
        setUser(undefined)
        setLoggedIn(false)
        return
      }

      setUser({
        userId: firebase.user.uid,
        email: firebase.user.email
      })
      setLoggedIn(true)
    }
  useEffect(onChangeLoggedInState, [firebase.user])

  return (
    <DefaultLayout title="ログインサンドボックス">
      <LoginSandboxComponent
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        login={login}
        logout={logout}
        isProccesing={isProccesing}
        user={user}
        error={error}
        isLoggedIn={isLoggedIn}
      />
    </DefaultLayout>)
}

export default App