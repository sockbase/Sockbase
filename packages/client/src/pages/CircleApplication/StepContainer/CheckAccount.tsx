import { useCallback, useMemo, useState } from 'react'
import { type User } from 'firebase/auth'
import styled from 'styled-components'
import FormButton from '../../../components/Form/Button'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormLabel from '../../../components/Form/Label'
import FormInput from '../../../components/Form/Input'
import dummyEyecatchImage from '../../../assets/dummy-eyecatch.jpg'
import LinkButton from '../../../components/Parts/LinkButton'
import Loading from '../../../components/Parts/Loading'
import Alert from '../../../components/Parts/Alert'
import useValidate from '../../../hooks/useValidate'
import useFirebaseError from '../../../hooks/useFirebaseError'

interface Props {
  user: User | null | undefined
  eyecatchURL: string | null
  nextStep: () => void
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const CheckAccount: React.FC<Props> = (props) => {
  const validator = useValidate()
  const { localize } = useFirebaseError()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isProgress, setProgress] = useState(false)

  const handleLogin = useCallback(() => {
    if (!email || !password) return

    setProgress(true)
    props.login(email, password)
      .then(() => setError(null))
      .catch((err: Error) => {
        setError(localize(err.message))
      })
      .finally(() => setProgress(false))
  }, [email, password])

  const errorCount = useMemo((): number => {
    const validators = [
      validator.isEmail(email),
      !validator.isEmpty(password)
    ]
    return validators.filter(v => !v).length
  }, [email, password])

  return (
    <>
      {props.user === undefined && <Loading text="認証情報" />}

      <p>
        {
          props.eyecatchURL
            ? <EyecatchImage src={props.eyecatchURL} />
            : <EyecatchImage src={dummyEyecatchImage} />
        }
      </p>

      <h1>Sockbaseアカウントをお持ちですか？</h1>

      {props.user === null
        ? <>
          <h2>Sockbaseアカウントを持っている場合</h2>

          <p>
            以前の申し込み時に使用したアカウントでログインしてください。
          </p>

          <FormSection>
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormInput type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </FormItem>
            <FormItem>
              <FormLabel>パスワード</FormLabel>
              <FormInput type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </FormItem>
          </FormSection>
          <FormSection>
            <FormItem>
              <FormButton onClick={handleLogin} disabled={isProgress || errorCount > 0}>ログイン</FormButton>
            </FormItem>
            <FormItem>
              <LinkButton color="default" to="/reset-password">パスワードを忘れた場合</LinkButton>
            </FormItem>
            {error &&
              <FormItem>
                <Alert title="エラーが発生しました" type="danger">
                  {error}
                </Alert>
              </FormItem>}
          </FormSection>

          <h2>Sockbaseアカウントを持っていない場合</h2>

          <p>
            申し込み手続き中にアカウントを作成します。<br />
            「申し込み説明画面へ進む」を押して次の画面に進んでください。
          </p>
        </>
        : <>
          <p>
            現在、<b>{props.user?.email}</b> としてログインしています。<br />
          </p>
          <Alert>
            別のアカウントで申し込みを行うには、ログアウトしてください。
          </Alert>
          <FormSection>
            <FormItem>
              <FormButton color="default" onClick={props.logout}>ログアウト</FormButton>
            </FormItem>
          </FormSection>
        </>}

      <FormSection>
        <FormItem>
          <FormButton onClick={props.nextStep}>申し込み説明画面へ進む</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default CheckAccount

const EyecatchImage = styled.img`
  width: 100%;
`
