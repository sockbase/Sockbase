import { useEffect, useState } from 'react'

import DefaultLayout from '../components/Layout/Default/Default'
import LoginSandboxComponent from '../components/pages/App/LoginSandbox'
import useFirebase from '../hooks/useFirebase'

export interface User {
  userId: string
  email?: string | null
}

const App: React.FC = () => {
  const firebase = useFirebase()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isProccesing, setProcessing] = useState(false)

  const [user, setUser] = useState<User | undefined>()
  const [isLoggedIn, setLoggedIn] = useState<boolean | undefined>()

  const login: () => void =
    () => {
      setProcessing(true)

      firebase.loginByEmail(email, password)
        .catch(e => {
          throw e
        })
        .finally(() => {
          setProcessing(false)
        })
    }
  const logout: () => void =
    () => {
      setProcessing(true)

      firebase.logout()
        .catch(e => {
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
        isLoggedIn={isLoggedIn}
      />
    </DefaultLayout>)
}

export default App
