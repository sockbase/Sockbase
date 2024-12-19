import { useCallback, useState } from 'react'
import { MdHome } from 'react-icons/md'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import LogotypeSVG from '../../assets/logotype.svg'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import Alert from '../../components/Parts/Alert'
import IconLabel from '../../components/Parts/IconLabel'
import LinkButton from '../../components/Parts/LinkButton'
import Loading from '../../components/Parts/Loading'
import useError from '../../hooks/useError'
import useFirebase from '../../hooks/useFirebase'
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
  const { convertErrorMessage } = useError()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isProccesing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>()

  const fromPathName = location.state?.from?.pathname

  const handleLogin = useCallback(() => {
    setProcessing(true)
    setErrorMessage(null)

    loginByEmailAsync(email, password)
      .then(() => navigate(fromPathName || '/dashboard', { replace: true }))
      .catch(err => {
        setErrorMessage(convertErrorMessage(err))
        throw err
      })
      .finally(() => {
        setProcessing(false)
      })
  }, [email, password])

  return (
    <DefaultBaseLayout isZeroPadding>
      <LoginFormArea>
        <BrandHeader>
          <BrandLogo>
            <LogotypeImage src={LogotypeSVG} />
          </BrandLogo>
          <BrandLabel>マイページ</BrandLabel>
        </BrandHeader>
        <LoginFormContent>
          {fromPathName && (
            <Alert
              title="ログインが必要です"
              type="warning">
                このページにアクセスするにはログインが必要です。
            </Alert>
          )}

          {user === null && (
            <Login
              email={email}
              errorMessage={errorMessage}
              isProcessing={isProccesing}
              login={handleLogin}
              password={password}
              setEmail={email => setEmail(email)}
              setPassword={password => setPassword(password)} />
          )}

          {user !== null && (
            <FormSection>
              {user === undefined && (
                <FormItem>
                  <Loading text="認証情報" />
                </FormItem>
              )}
              {user && (
                <FormItem>
                  <Alert
                    title={`${user.email} としてログイン中です`}
                    type="info" />
                </FormItem>
              )}
              {user !== null && (
                <FormItem>
                  <LinkButton
                    color="primary"
                    disabled={!user}
                    to="/dashboard">
                    <IconLabel
                      icon={<MdHome />}
                      label="マイページに進む" />
                  </LinkButton>
                </FormItem>
              )}
            </FormSection>
          )}
        </LoginFormContent>
      </LoginFormArea>

      {!fromPathName && (
        <IntroductionArea>
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
        </IntroductionArea>
      )}
    </DefaultBaseLayout>
  )
}

export default IndexPage

const LoginFormArea = styled.div`
  background-color: var(--panel2-background-color);
`
const BrandHeader = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 5px;
  padding: 20px;
  background-color: var(--brand-color);
  color: var(--white-color);
`
const BrandLogo = styled.div`
`
const LogotypeImage = styled.img`
  margin-bottom: -2px;
  height: 1.25em;
  svg {
    fill: var(--brand-primary-color);
  }
`
const BrandLabel = styled.div`
  font-weight: bold;
`
const LoginFormContent = styled.div`
  padding: 20px;
`
const IntroductionArea = styled.div`
  padding: 40px;
  @media screen and (max-width: 840px) {
    padding: 20px;
  }
`
