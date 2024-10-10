import { useEffect, useRef, useState } from 'react'
import Alert from '../../../components/Parts/Alert'
import useFirebase from '../../../hooks/useFirebase'
import useFirebaseError from '../../../hooks/useFirebaseError'

interface Props {
  oobCode: string
}
const VerifyEmail: React.FC<Props> = (props) => {
  const { applyActionCodeAsync } = useFirebase()
  const { localize } = useFirebaseError()

  const [isSuccess, setSuccess] = useState<boolean>()
  const [errorMessage, setErrorMessage] = useState<string>()

  const isRequested = useRef(false)

  useEffect(() => {
    applyActionCodeAsync(props.oobCode)
      .then(() => {
        setSuccess(true)
        isRequested.current = true
      })
      .catch(err => {
        if (isRequested.current) return
        setErrorMessage(localize(err.message))
        throw err
      })
  }, [])

  return (
    <>
      {errorMessage && <Alert type="error" title="エラーが発生しました">
        {errorMessage}
      </Alert>}

      {isSuccess && <Alert type="success" title="メールアドレスの確認が完了しました">
        タブを閉じてください。
      </Alert>}
    </>
  )
}

export default VerifyEmail
