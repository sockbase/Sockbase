import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Alert from '../../components/Parts/Alert'
import DefaultBaseLayout from '../../layouts/DefaultBaseLayout/DefaultBaseLayout'
import PasswordReset from './PasswordReset/PasswordReset'
import VerifyEmail from './VerifyEmail/VerifyEmail'

const ActionPage: React.FC = () => {
  const [searchParams] = useSearchParams()

  const [actionMode, setActionMode] = useState<string>()
  const [oobCode, setOOBCode] = useState<string>()

  const [errorMessage, setErrorMessage] = useState<string>()

  const form = useMemo(() => {
    if (!oobCode) return
    if (actionMode === 'resetPassword') {
      return {
        title: 'パスワード再設定',
        element: <PasswordReset oobCode={oobCode} />
      }
    } else if (actionMode === 'verifyEmail') {
      return {
        title: 'メールアドレス確認',
        element: <VerifyEmail oobCode={oobCode} />
      }
    }
  }, [actionMode, oobCode])

  useEffect(() => {
    const paramActionMode = searchParams.get('mode')
    const paramOOBCode = searchParams.get('oobCode')
    if (!paramOOBCode || !paramActionMode) {
      setErrorMessage('URLが間違っています。')
      return
    }
    setActionMode(paramActionMode)
    setOOBCode(paramOOBCode)
  }, [searchParams])

  return (
    <DefaultBaseLayout title={form?.title}>
      {errorMessage && <Alert title="エラーが発生しました" type="danger">
        {errorMessage}
      </Alert>}

      {form && <>
        <h1>{form.title}</h1>
        {form.element}
      </>}
    </DefaultBaseLayout>
  )
}

export default ActionPage
