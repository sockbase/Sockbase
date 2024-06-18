import { useCallback } from 'react'
import FormButton from '../../../../components/Form/Button'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import LoginForm from '../../../../components/LoginForm'
import Alert from '../../../../components/Parts/Alert'
import type { User } from 'firebase/auth'
import type { SockbaseStoreDocument } from 'sockbase'

interface Props {
  store: SockbaseStoreDocument | undefined
  user: User | null | undefined
  loginAsync: (email: string, password: string) => Promise<void>
  logoutAsync: () => Promise<void>
  nextStep: () => void
}
const CheckAccount: React.FC<Props> = (props) => {
  const handleLogout = useCallback(() => {
    props.logoutAsync()
      .catch(err => { throw err })
  }, [])

  return (
    <>
      <h1>Sockbase アカウントはお持ちですか？</h1>

      {props.user === null && <>
        <h2>Sockbase アカウントを持っている場合</h2>
        <p>
            以前の申し込み時に使用したアカウントでログインしてください。
        </p>

        <LoginForm />

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
          <FormButton onClick={props.nextStep}>
            申し込み説明画面へ進む
          </FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default CheckAccount
