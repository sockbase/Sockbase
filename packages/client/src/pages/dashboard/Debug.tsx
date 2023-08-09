import DashboardLayout from '../../components/Layout/Dashboard/Dashboard'

import useFirebase from '../../hooks/useFirebase'

import { MdCottage } from 'react-icons/md'
import PageTitle from '../../components/Layout/Dashboard/PageTitle'
import useChat from '../../hooks/useChat'
import { useEffect, useState } from 'react'
import FormSection from '../../components/Form/FormSection'
import FormItem from '../../components/Form/FormItem'
import FormInput from '../../components/Form/Input'
import FormButton from '../../components/Form/Button'

const DashboardContainer: React.FC = () => {
  const { user, roles } = useFirebase()
  const { startStream, messages, sendMessageAsync } = useChat()

  const [message, setMessage] = useState('')
  const [isProgress, setProgress] = useState(false)

  useEffect(() => {
    if (!user) return

    startStream(user.uid)
  }, [user])

  useEffect(() => {
    console.log(messages)
  }, [messages])

  const handleSendMessage = (): void => {
    if (!message) return
    setProgress(true)

    sendMessageAsync(message)
      .then(() => setMessage(''))
      .catch(err => { throw err })
      .finally(() => setProgress(false))
  }

  return (
    <DashboardLayout title="デバッグボード">
      <PageTitle
        icon={<MdCottage />}
        title="デバッグボード"
        description="デバッグ情報を表示します。" />

      <h2>ユーザー情報</h2>
      <table>
        <tbody>
          <tr>
            <th>ユーザID</th>
            <td>{user?.uid}</td>
          </tr>
          <tr>
            <th>メールアドレス</th>
            <td>{user?.email}</td>
          </tr>
        </tbody>
      </table>

      <h2>カスタムクレーム</h2>

      <h3>ロール</h3>
      {
        roles && Object.entries(roles).map(([k, v]) => <li key={k}>{k}: {v}</li>)
      }

      <h2>チャット</h2>
      <FormSection>
        <FormItem>
          <FormInput
            placeholder='メッセージ'
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={isProgress} />
        </FormItem>
        <FormItem>
          <FormButton
            onClick={handleSendMessage}
            inlined
            disabled={!message || isProgress}>送信</FormButton>
        </FormItem>
      </FormSection>
      <ul>
        {messages.map(m => <li key={m.id}>{m.userId}: {m.content}</li>)}
      </ul>

    </DashboardLayout>
  )
}

export default DashboardContainer
