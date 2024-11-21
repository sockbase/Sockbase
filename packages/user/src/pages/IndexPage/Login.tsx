import { MdLogin, MdQuestionMark } from 'react-icons/md'
import FormButton from '../../components/Form/FormButton'
import FormInput from '../../components/Form/FormInput'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/FormLabel'
import FormSection from '../../components/Form/FormSection'
import Alert from '../../components/Parts/Alert'
import IconLabel from '../../components/Parts/IconLabel'
import LinkButton from '../../components/Parts/LinkButton'

interface Props {
  email: string
  password: string
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  login: () => void
  isProcessing: boolean
  errorMessage: string | null | undefined
}
const Login: React.FC<Props> = (props) => {
  return (
    <>
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
            onChange={e => props.setPassword(e.target.value)}
            onKeyDown={e => e.code === 'Enter' && props.login()} />
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem $inlined>
          <FormButton
            color='primary'
            onClick={props.login}
            disabled={!props.email || !props.password || props.isProcessing}>
            <IconLabel icon={<MdLogin />} label="ログイン" />
          </FormButton>
          <LinkButton
            to="/reset-password"
            disabled={props.isProcessing}>
            <IconLabel icon={<MdQuestionMark />} label="パスワードを忘れた場合" />
          </LinkButton>
        </FormItem>
        {props.errorMessage && (
          <FormItem>
            <Alert type="error" title="エラーが発生しました">
              {props.errorMessage}
            </Alert>
          </FormItem>
        )}
      </FormSection>
    </>
  )
}

export default Login
