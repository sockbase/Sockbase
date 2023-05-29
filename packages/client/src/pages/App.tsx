import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

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
      <p>
        <a href="https://nectarition.jp">ねくたりしょん</a>が提供するイベント申し込み情報管理サービスです。
      </p>

      <h3>マイページへのアクセス方法</h3>
      <p>
        サークル申し込み時, チケット購入時・受け取り時にアカウントを作成することができます。<br />
        作成したアカウントとパスワードを用いて、上のログイン画面からログインしてください。
      </p>

      <h3>支払い方法</h3>
      <p>
        オンライン決済(クレジットカード, Google Pay, Apple Pay)のほか、銀行振込に対応しています。
      </p>

      <h3>イベントへの申し込み方法</h3>
      <p>
        イベント主催者から提供されたURLを使用してください。
      </p>

      <h3>問い合わせ先</h3>
      <ul>
        <li>アカウント登録前のお問い合わせ: <code>support@sockbase.net</code></li>
        <li>申し込み後に関するお問い合わせ: マイページメニューの「お問い合わせ」</li>
      </ul>

      <h3>表記事項</h3>
      <ul>
        <li><Link to="/tos">利用規約・特定商取引法に基づく表記</Link></li>
        <li><Link to="/privacy-policy">プライバシーポリシー</Link></li>
      </ul>
    </DefaultLayout>)
}

export default App
