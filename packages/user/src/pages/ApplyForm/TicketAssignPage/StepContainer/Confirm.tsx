import { useState, useCallback } from 'react'
import { MdArrowBack, MdCheck } from 'react-icons/md'
import FormButton from '../../../../components/Form/FormButton'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import Alert from '../../../../components/Parts/Alert'
import IconLabel from '../../../../components/Parts/IconLabel'
import UserDataView from '../../../../components/UserDataView'
import useError from '../../../../hooks/useError'
import type { SockbaseAccount, SockbaseAccountSecure, SockbaseStoreDocument, SockbaseStoreType } from 'sockbase'

interface Props {
  store: SockbaseStoreDocument
  selectedType: SockbaseStoreType
  fetchedUserData: SockbaseAccount | null | undefined
  userData: SockbaseAccountSecure | undefined
  submitAsync: () => Promise<void>
  prevStep: () => void
  nextStep: () => void
}
const Confirm: React.FC<Props> = props => {
  const { convertErrorMessage } = useError()

  const [isProgress, setProgress] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>()

  const handleSubmit = useCallback(() => {
    setProgress(true)
    setErrorMessage(null)
    props.submitAsync()
      .then(() => props.nextStep())
      .catch(err => {
        setErrorMessage(convertErrorMessage(err))
        setProgress(false)
        throw err
      })
  }, [])

  return (
    <>
      <h1>入力内容確認</h1>

      <h2>イベント情報</h2>
      <table>
        <tbody>
          <tr>
            <th>チケット名</th>
            <td>{props.store.name}</td>
          </tr>
          <tr>
            <th>参加種別</th>
            <td>{props.selectedType.name}</td>
          </tr>
        </tbody>
      </table>

      <UserDataView
        fetchedUserData={props.fetchedUserData}
        isTicketAssignPage={true}
        userData={props.userData} />

      <h1>チケットを受け取る</h1>
      <p>
        上記の内容で正しければ「チケットを受け取る」ボタンを押してください。
      </p>
      <p>
        修正する場合は「修正」ボタンを押してください。
      </p>

      {errorMessage && (
        <Alert
          title="エラーが発生しました"
          type="error">
          {errorMessage}
        </Alert>
      )}

      <FormSection>
        <FormItem>
          <FormButton
            disabled={isProgress}
            onClick={props.prevStep}>
            <IconLabel
              icon={<MdArrowBack />}
              label="修正する" />
          </FormButton>
        </FormItem>
      </FormSection>
      <FormSection>
        <FormItem>
          <FormButton
            color="primary"
            disabled={isProgress}
            onClick={handleSubmit}>
            <IconLabel
              icon={<MdCheck />}
              label="チケットを受け取る" />
          </FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Confirm
