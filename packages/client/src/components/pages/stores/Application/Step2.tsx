import type { SockbaseAccountSecure, SockbaseTicketApplication } from 'sockbase'

import FormButton from '../../../Form/Button'
import FormItem from '../../../Form/FormItem'
import FormSection from '../../../Form/FormSection'

interface Props {
  app: SockbaseTicketApplication | undefined
  userData: SockbaseAccountSecure | undefined
  prevStep: () => void
  nextStep: () => void
}

const Step2: React.FC<Props> = (props) => {
  const handleSubmit: () => void =
    () => {
      alert('aaa')
      props.nextStep()
    }

  return (
    <>
      {props.app && props.userData && <>
        <h1>入力内容確認</h1>

        <h2>参加者情報</h2>
        <table>
          <tbody>
            <tr>
              <th>氏名</th>
              <td>{props.userData.name}</td>
            </tr>
            <tr>
              <th>生年月日</th>
              <td>{new Date(props.userData.birthday).toLocaleDateString()}</td>
            </tr>
            <tr>
              <th>郵便番号</th>
              <td>{props.userData.postalCode}</td>
            </tr>
            <tr>
              <th>住所</th>
              <td>{props.userData.address}</td>
            </tr>
            <tr>
              <th>電話番号</th>
              <td>{props.userData.postalCode}</td>
            </tr>
          </tbody>
        </table>

        <h2>通信欄</h2>
        <p>
          {props.app.remarks || '(空欄)'}
        </p>

        <h2>参加費</h2>

        <h3>選択した参加種別</h3>
        <table>
          <tbody>
            <tr>
              <th>種類</th>
              <td>ああああ</td>
            </tr>
            <tr>
              <th>詳細</th>
              <td>いいいい</td>
            </tr>
            <tr>
              <th>参加費</th>
              <td>うううう円</td>
            </tr>
          </tbody>
        </table>

        <h3>決済方法</h3>
        <p>
          決済方法
        </p>

        <h1>申し込み情報送信</h1>
        <p>
          上記の内容で正しければ「決済に進む(申し込み情報送信)」ボタンを押してください。
        </p>
        <p>
          修正する場合は「修正」ボタンを押してください。
        </p>

        <FormSection>
          <FormItem>
            <FormButton color="default"
              onClick={() => props.prevStep()}>
              修正する
            </FormButton>
          </FormItem>
          <FormItem>
            <FormButton
              onClick={handleSubmit}>
              決済に進む(申し込み情報送信)
            </FormButton>
          </FormItem>
        </FormSection>
      </>}
    </>
  )
}

export default Step2
