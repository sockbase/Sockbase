import FormButton from '../../components/Form/Button'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import FormInput from '../../components/Form/Input'
import FormLabel from '../../components/Form/Label'
import Alert from '../../components/Parts/Alert'
import LinkButton from '../../components/Parts/LinkButton'

interface Props {
  email: string
  password: string
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  login: () => void
  isProcessing: boolean
  error?: { title: string, content: string } | null
}
const Login: React.FC<Props> = (props) => {
  return (
    <>
      <h1>Sockbaseマイページにログイン</h1>
      <p>
        イベント・チケット申し込み時に入力したメールアドレスとパスワードを入力してください。
      </p>
      <FormSection>
        <FormItem>
          <FormLabel>メールアドレス</FormLabel>
          <FormInput type="email"
            value={props.email}
            onChange={e => props.setEmail(e.target.value)} />
        </FormItem>
        <FormItem>
          <FormLabel>パスワード</FormLabel>
          <FormInput type="password"
            value={props.password}
            onChange={e => props.setPassword(e.target.value)} />
        </FormItem>
        <FormItem>
          <FormButton
            onClick={props.login}
            disabled={!props.email || !props.password || props.isProcessing}>ログイン</FormButton>
        </FormItem>
        <FormItem>
          <LinkButton color="default" to="/reset-password">パスワードを忘れた場合</LinkButton>
        </FormItem>
        {props.error &&
          <FormItem>
            <Alert title={props.error.title}>
              {props.error.content}
            </Alert>
          </FormItem>}
      </FormSection>
    </>
  )
}

export default Login
