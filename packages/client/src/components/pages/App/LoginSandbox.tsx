import type { User } from '../../../containers/App'

import Form from '../../Form/Form'
import FormSection from '../../Form/FormSection'
import FormItem from '../../Form/FormItem'
import FormLabel from '../../Form/Label'
import FormInput from '../../Form/Input'
import FormButton from '../../Form/Button'
import Alert from '../../Parts/Alert'

interface Props {
  email: string
  password: string
  setEmail: (email: string) => void
  setPassword: (password: string) => void

  login: () => void
  logout: () => void
  isProccesing: boolean
  error?: { title: string, content: string }

  user?: User
  isLoggedIn?: boolean
}

const LoginSandbox: React.FC<Props> = (props) => {
  return (
    <>
      <h1>ログインサンドボックス</h1>

      <h2>ログイン</h2>
      {
        props.error &&
        <Alert
          type="danger"
          title={props.error.title}>{props.error.content}</Alert>
      }

      <Form>
        <FormSection>
          <FormItem>
            <FormLabel>メールアドレス</FormLabel>
            <FormInput
              type="email"
              autoComplete="email"
              value={props.email}
              onChange={(e) => props.setEmail(e.target.value)} />
          </FormItem>
          <FormItem>
            <FormLabel>パスワード</FormLabel>
            <FormInput
              type="password"
              autoComplete="current-password"
              value={props.password}
              onChange={(e) => props.setPassword(e.target.value)} />
          </FormItem>
        </FormSection>
        <FormSection>
          <FormItem>
            <FormButton
              type="button"
              onClick={() => props.login()}
              disabled={props.isProccesing || props.isLoggedIn}>ログイン</FormButton>
          </FormItem>
          <FormItem>
            <FormButton type="button"
              onClick={() => props.logout()}
              disabled={props.isProccesing || !props.isLoggedIn}>ログアウト</FormButton>
          </FormItem>
        </FormSection>
      </Form>

      <h2>ログイン状態</h2>
      <table>
        <thead>
          <tr>
            <th>Key</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>ログイン状態</th>
            <td>{props.isLoggedIn === undefined
              ? '認証中'
              : props.isLoggedIn
                ? 'ログイン中'
                : '未ログイン'}</td>
          </tr>
          <tr>
            <th>ユーザID</th>
            <td>{props.user?.userId ?? '-'}</td>
          </tr>
          <tr>
            <th>メールアドレス</th>
            <td>{props.user?.email ?? '-'}</td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

export default LoginSandbox
