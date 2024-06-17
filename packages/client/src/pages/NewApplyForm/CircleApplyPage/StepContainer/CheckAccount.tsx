import { useState, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import dummyEyecatchImage from '../../../../assets/dummy-eyecatch.jpg'
import FormButton from '../../../../components/Form/Button'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import FormInput from '../../../../components/Form/Input'
import FormLabel from '../../../../components/Form/Label'
import Alert from '../../../../components/Parts/Alert'
import LinkButton from '../../../../components/Parts/LinkButton'
import useFirebase from '../../../../hooks/useFirebase'
import useFirebaseError from '../../../../hooks/useFirebaseError'
import useValidate from '../../../../hooks/useValidate'
import type { User } from 'firebase/auth'

interface Props {
  eyecatchURL: string | null | undefined
  user: User | null | undefined
  nextStep: () => void
}
const CheckAccount: React.FC<Props> = (props) => {
  const validator = useValidate()
  const { loginByEmailAsync, logoutAsync } = useFirebase()
  const { localize } = useFirebaseError()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isProgress, setProgress] = useState(false)

  const errorCount = useMemo((): number => {
    const validators = [
      validator.isEmail(email),
      !validator.isEmpty(password)
    ]
    return validators.filter(v => !v).length
  }, [email, password])

  const handleLogin = useCallback(() => {
    if (errorCount > 0) return

    setProgress(true)
    setError(null)

    loginByEmailAsync(email, password)
      .catch((err: Error) => {
        setError(localize(err.message))
      })
      .finally(() => setProgress(false))
  }, [email, password])

  const handleLogout = useCallback(() => {
    logoutAsync()
      .catch(err => { throw err })
  }, [])

  return (
    <>
      <p>
        {props.eyecatchURL
          ? <EyecatchImage src={props.eyecatchURL} />
          : <EyecatchImage src={dummyEyecatchImage} />}
      </p>

      <h1>Sockbase アカウントはお持ちですか？</h1>

      {props.user === null && <>
        <h2>Sockbase アカウントを持っている場合</h2>
        <p>
            以前の申し込み時に使用したアカウントでログインしてください。
        </p>

        <FormSection>
          <FormItem>
            <FormLabel>メールアドレス</FormLabel>
            <FormInput
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)} />
          </FormItem>
          <FormItem>
            <FormLabel>パスワード</FormLabel>
            <FormInput
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}/>
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

        <h2>Sockbase アカウントを持っていない場合</h2>
        <p>
            申し込み手続き中にアカウントを作成します。<br />
            「申し込み説明画面へ進む」を押して次の画面に進んでください。
        </p>
      </>}

      {props.user && <>
        <p>
            現在、<b>{props.user.email}</b> としてログインしています。<br />
        </p>
        <Alert>
            別のアカウントで申し込みを行うには、ログアウトしてください。
        </Alert>
        <FormSection>
          <FormItem>
            <FormButton color="default" onClick={handleLogout}>ログアウト</FormButton>
          </FormItem>
        </FormSection>
      </>}

      <FormSection>
        <FormItem>
          <FormButton
            onClick={props.nextStep}>
            申し込み説明画面へ進む
          </FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default CheckAccount

const EyecatchImage = styled.img`
  width: 100%;
`
