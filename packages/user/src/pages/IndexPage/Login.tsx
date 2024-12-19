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
const Login: React.FC<Props> = props => {
  return (
    <>
      <p>
        イベント・チケット申し込み時に入力したメールアドレスとパスワードを入力してください。
      </p>
      <FormSection>
        <FormItem>
          <FormLabel>メールアドレス</FormLabel>
          <FormInput
            onChange={e => props.setEmail(e.target.value)}
            type="email"
            value={props.email} />
        </FormItem>
        <FormItem>
          <FormLabel>パスワード</FormLabel>
          <FormInput
            onChange={e => props.setPassword(e.target.value)}
            onKeyDown={e => e.code === 'Enter' && props.login()}
            type="password"
            value={props.password} />
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem $inlined>
          <FormButton
            color="primary"
            disabled={!props.email || !props.password || props.isProcessing}
            onClick={props.login}>
            <IconLabel
              icon={<MdLogin />}
              label="ログイン" />
          </FormButton>
          <LinkButton
            disabled={props.isProcessing}
            to="/reset-password">
            <IconLabel
              icon={<MdQuestionMark />}
              label="パスワードを忘れた場合" />
          </LinkButton>
        </FormItem>
        {props.errorMessage && (
          <FormItem>
            <Alert
              title="エラーが発生しました"
              type="error">
              {props.errorMessage}
            </Alert>
          </FormItem>
        )}
      </FormSection>
    </>
  )
}

export default Login
