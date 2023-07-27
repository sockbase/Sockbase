import { useMemo } from 'react'
import { type SockbaseAccount, type SockbaseStoreDocument, type SockbaseTicketUserDocument } from 'sockbase'
import FormButton from '../../../Form/Button'
import FormItem from '../../../Form/FormItem'
import FormSection from '../../../Form/FormSection'

interface Props {
  store: SockbaseStoreDocument
  ticketUser: SockbaseTicketUserDocument
  userData: SockbaseAccount | null
  submitAssignTicket: () => Promise<void>
  nextStep: () => void
  prevStep: () => void
}
const Step2: React.FC<Props> = (props) => {
  const handleSubmit = (): void => {
    props.submitAssignTicket()
      .then(() => props.nextStep())
      .catch(err => { throw err })
  }

  const typeName = useMemo(() => {
    if (!props.store || !props.ticketUser) return ''

    const type = props.store.types
      .filter(t => t.id === props.ticketUser.typeId)[0]
    return type.name
  }, [props.store, props.ticketUser])

  return (
    <>
      <h1>入力内容確認</h1>

      <h2>イベント情報</h2>
      <table>
        <tbody>
          <tr>
            <th>チケット名</th>
            <td>{props.store.storeName}</td>
          </tr>
          <tr>
            <th>参加種別</th>
            <td>{typeName}</td>
          </tr>
        </tbody>
      </table>

      <h2>使用者情報</h2>

      <table>
        <tbody>
          <tr>
            <th>メールアドレス</th>
            <td>{props.userData?.email}</td>
          </tr>
          <tr>
            <th>氏名</th>
            <td>{props.userData?.name}</td>
          </tr>
          <tr>
            <th>郵便番号</th>
            <td>{props.userData?.postalCode}</td>
          </tr>
          <tr>
            <th>住所</th>
            <td>{props.userData?.address}</td>
          </tr>
          <tr>
            <th>電話番号</th>
            <td>{props.userData?.telephone}</td>
          </tr>
        </tbody>
      </table>

      <FormSection>
        <FormItem>
          <FormButton onClick={() => props.prevStep()} color="default">修正する</FormButton>
        </FormItem>
        <FormItem>
          <FormButton onClick={handleSubmit}>チケットを受け取る</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Step2
