import { useState } from 'react'
import FormButton from '../../../../components/Form/Button'
import FormCheckbox from '../../../../components/Form/Checkbox'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import Alert from '../../../../components/Parts/Alert'
import AnchorButton from '../../../../components/Parts/AnchorButton'
import useDayjs from '../../../../hooks/useDayjs'
import type { User } from 'firebase/auth'
import type { SockbaseStore, SockbaseStoreType, SockbaseTicket, SockbaseTicketAddedResult } from 'sockbase'

interface Props {
  user: User | null | undefined
  ticket: SockbaseTicket | undefined
  store: SockbaseStore
  addedResult: SockbaseTicketAddedResult | undefined
  selectedType: SockbaseStoreType | undefined
  selectedPaymentMethod: { id: string, description: string } | undefined
  nextStep: () => void
}
const Payment: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()
  const [checkedPayment, setCheckedPayment] = useState(false)

  return (
    <>
      <Alert type="success" title="申し込み情報の送信が完了しました">
      申し込みIDは「{props.addedResult?.hashId}」です。
      </Alert>
      <p>
        お申し込みいただきましてありがとうございました。<br />
        申込内容の控えを入力していただいたメールアドレスに送信しましたのでご確認ください。
      </p>

      {props.selectedType?.productInfo
        ? <>
          <h1>参加費のお支払い</h1>
          <table>
            <tbody>
              <tr>
                <th>お支払い方法</th>
                <td>{props.selectedPaymentMethod?.description}</td>
              </tr>
              <tr>
                <th>お支払い代金</th>
                <td>{props.selectedType?.price.toLocaleString()}円</td>
              </tr>
              <tr>
                <th>お支払い期限</th>
                <td>{formatByDate(props.store.schedules.endApplication, 'YYYY年 M月 D日 H時mm分')}</td>
              </tr>
              <tr>
                <th>お支払い補助番号</th>
                <td>{props.addedResult?.bankTransferCode}</td>
              </tr>
            </tbody>
          </table>

          <p>
            下に記載しているお支払い方法のご案内に従い、参加費のお支払いをお願いいたします。<br />
            決済が完了すると「決済完了のお知らせ」メールをご登録いただいたメールアドレスに送付いたしますので、必ずご確認ください。<br />
            銀行振込の場合、振り込みの確認が完了するまで1週間ほどお時間をいただきます。予めご了承ください。
          </p>

          {props.ticket?.paymentMethod === 'online'
            ? <>
              <h2>オンライン決済でのお支払い</h2>
              <Alert>
                メールアドレスは自動で入力されます。<br />
                別のメールアドレスを入力すると、お支払い状態の更新ができませんので、<b>絶対に変更しないでください。</b>
              </Alert>
              <p>
                「決済画面を開く」より決済を行ってください。
              </p>
              <FormSection>
                <FormItem>
                  <AnchorButton
                    href={`${props.selectedType?.productInfo?.paymentURL}?prefilled_email=${encodeURIComponent(props.user?.email ?? '')}`}
                    target="_blank"
                    onClick={() => setCheckedPayment(true)}>決済画面を開く</AnchorButton>
                </FormItem>
              </FormSection>
            </>
            : <>
              <h2>銀行振込でのお支払い</h2>
              <p>
                <b>{formatByDate(props.store.schedules.endApplication, 'YYYY年 M月 D日')}</b> までに以下の口座へ所定の金額のお振り込みをお願いいたします。
              </p>
              <Alert>
                お振り込みの特定を容易にするため、ご依頼人名の先頭にお支払い補助番号「<b>{props.addedResult?.bankTransferCode}</b>」を入力してください。
              </Alert>

              <table>
                <tbody>
                  <tr>
                    <th>振込先銀行</th>
                    <td>GMOあおぞらネット銀行(金融機関コード0310)</td>
                  </tr>
                  <tr>
                    <th>加入者名</th>
                    <td>サイグサトモタダ</td>
                  </tr>
                  <tr>
                    <th>預金種目</th>
                    <td>普通</td>
                  </tr>
                  <tr>
                    <th>支店名</th>
                    <td>チャイム支店</td>
                  </tr>
                  <tr>
                    <th>口座番号</th>
                    <td>4598308</td>
                  </tr>
                </tbody>
              </table>

              <Alert>
                ※振込みにかかる手数料は、お客様負担となります。
              </Alert>
              <FormSection>
                <FormCheckbox
                  name="check-payment"
                  label="振込情報を確認しました"
                  checked={checkedPayment}
                  onChange={checked => setCheckedPayment(checked)} />
              </FormSection>
            </>}
        </>
        : <p>
          今回、事前にお支払いいただく必要はありません。<br />
          このまま次に進んでください。
        </p>}

      <FormSection>
        <FormItem>
          <FormButton
            onClick={props.nextStep}
            disabled={!!props.selectedType?.productInfo && !checkedPayment}>
            次へ進む
          </FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Payment
