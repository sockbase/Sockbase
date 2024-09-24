import { useCallback, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import Alert from '../../components/Parts/Alert'
import LinkButton from '../../components/Parts/LinkButton'
import Loading from '../../components/Parts/Loading'
import useFirebase from '../../hooks/useFirebase'
import useFirebaseError from '../../hooks/useFirebaseError'
import DefaultBaseLayout from '../../layouts/DefaultBaseLayout/DefaultBaseLayout'
import InformationList from './InformationList'
import Login from './Login'

export interface User {
  userId: string
  email?: string | null
}

const IndexPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loginByEmailAsync } = useFirebase()
  const { localize: localizeFirebaseError } = useFirebaseError()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isProccesing, setProcessing] = useState(false)
  const [error, setError] = useState<{ title: string, content: string } | null>()

  const fromPathName = location.state?.from?.pathname

  const handleLogin = useCallback(() => {
    setProcessing(true)
    setError(null)

    loginByEmailAsync(email, password)
      .then(() => navigate(fromPathName || '/dashboard', { replace: true }))
      .catch((e: Error) => {
        const message = localizeFirebaseError(e.message)
        setError({ title: 'ログインに失敗しました', content: message })
        throw e
      })
      .finally(() => {
        setProcessing(false)
      })
  }, [email, password])

  return (
    <DefaultBaseLayout>
      <h2>Sockbase マイページにログイン</h2>

      {fromPathName && <Alert title="ログインが必要です" type="danger">
        このページにアクセスするにはログインが必要です。
      </Alert>}

      {user === undefined
        ? <Loading text='認証情報' />
        : user !== null
          ? <p>
            {user.email} としてログイン中です
          </p>
          : <Login
            email={email}
            password={password}
            setEmail={email => setEmail(email)}
            setPassword={password => setPassword(password)}
            login={handleLogin}
            isProcessing={isProccesing}
            error={error} />
      }

      {user !== null && <FormSection>
        <FormItem>
          <LinkButton to="/dashboard" disabled={!user}>マイページに進む</LinkButton>
        </FormItem>
      </FormSection>}

      {!fromPathName && <>
        <InformationList />

        <h2>Sockbase とは？</h2>
        <p>
          <a href="https://nectarition.jp">ねくたりしょん</a>が提供するイベント申し込み情報管理サービスです。
        </p>

        <h3>マイページへのアクセス方法</h3>
        <p>
          サークル申し込み時, チケット購入時・受け取り時にアカウントを作成することができます。<br />
          作成したアカウントとパスワードを用いて、上のログイン画面からログインしてください。
        </p>

        <h3>お支払い方法</h3>
        <p>
          オンライン決済 (クレジットカード, Google Pay, Apple Pay) がご利用いただけます。<br />
          イベントによっては銀行振込もご利用いただけます。
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

        <h3>法律に基づく事項</h3>
        <ul>
          <li><Link to="/tos">利用規約・特定商取引法に基づく表記</Link></li>
          <li><Link to="/privacy-policy">プライバシーポリシー</Link></li>
        </ul>
      </>}
    </DefaultBaseLayout>)
}

export default IndexPage
