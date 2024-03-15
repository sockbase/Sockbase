import { useMemo, useState } from 'react'
import sockbaseShared from 'shared'
import { type SockbaseStoreType, type SockbaseStoreDocument, type SockbaseTicket, type SockbaseTicketAddedResult } from 'sockbase'
import FormButton from '../../../components/Form/Button'
import FormCheckbox from '../../../components/Form/Checkbox'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import Alert from '../../../components/Parts/Alert'
import AnchorButton from '../../../components/Parts/AnchorButton'
import useDayjs from '../../../hooks/useDayjs'

interface Props {
  store: SockbaseStoreDocument
  ticketInfo: SockbaseTicket | undefined
  ticketResult: SockbaseTicketAddedResult | undefined
  email: string | undefined
  nextStep: () => void
}
const Step3: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()

  const [checkedPayment, setCheckedPayment] = useState(false)

  const selectedType = useMemo((): SockbaseStoreType | null => {
    if (!props.store || !props.ticketInfo) return null
    return props.store.types
      .filter(t => t.id === props.ticketInfo?.typeId)[0]
  }, [props.store, props.ticketInfo])

  const selectedPaymentMethod = useMemo((): string => {
    if (!props.ticketInfo?.paymentMethod) return ''
    return sockbaseShared.constants.payment.methods
      .filter(p => p.id === props.ticketInfo?.paymentMethod)[0].description
  }, [props.ticketInfo])

  return (
    <>
      <Alert type="success" title="申し込み情報の送信が完了しました">
        申し込みIDは「{props.ticketResult?.hashId}」です。
      </Alert>
      <p>
        お申し込みいただきましてありがとうございました。<br />
        申込内容の控えを入力していただいたメールアドレスに送信しましたのでご確認ください。
      </p>

      {selectedType?.productInfo
        ? <>
          <h1>参加費のお支払い</h1>
          <table>
            <tbody>
              <tr>
                <th>お支払い方法</th>
                <td>{selectedPaymentMethod}</td>
              </tr>
              <tr>
                <th>お支払い代金</th>
                <td>{selectedType?.price.toLocaleString()}円</td>
              </tr>
              <tr>
                <th>お支払い期限</th>
                <td>{formatByDate(props.store.schedules.endApplication, 'YYYY年M月D日 H時mm分')}</td>
              </tr>
              <tr>
                <th>お支払い補助番号</th>
                <td>{props.ticketResult?.bankTransferCode}</td>
              </tr>
            </tbody>
          </table>

          <p>
            下に記載しているお支払い方法のご案内に従い、参加費のお支払いをお願いいたします。<br />
            決済が完了すると「決済完了のお知らせ」メールをご登録いただいたメールアドレスに送付いたしますので、必ずご確認ください。<br />
            銀行振込の場合、振り込みの確認が完了するまで1週間ほどお時間をいただきます。予めご了承ください。
          </p>

          {props.ticketInfo?.paymentMethod === 'online'
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
                    href={`${selectedType?.productInfo?.paymentURL}?prefilled_email=${encodeURIComponent(props.email ?? '')}`}
                    target="_blank"
                    onClick={() => setCheckedPayment(true)}>決済画面を開く</AnchorButton>
                </FormItem>
              </FormSection>
            </>
            : <>
              <h2>銀行振込でのお支払い</h2>
              <p>
                <b>{formatByDate(props.store.schedules.endApplication, 'YYYY年M月D日')}</b> までに以下の口座へ所定の金額のお振り込みをお願いいたします。
              </p>
              <Alert>
                お振り込みの特定を容易にするため、ご依頼人名の先頭にお支払い補助番号「<b>{props.ticketResult?.bankTransferCode}</b>」を入力してください。
              </Alert>

              <h3>ゆうちょ銀行からお振込みの場合</h3>
              <table>
                <tbody>
                  <tr>
                    <th>加入者名</th>
                    <td>ノートセンディング</td>
                  </tr>
                  <tr>
                    <th>口座記号・口座番号</th>
                    <td>10740-30814531</td>
                  </tr>
                </tbody>
              </table>

              <h3>ゆうちょ銀行以外からお振込みの場合</h3>
              <table>
                <tbody>
                  <tr>
                    <th>振込先銀行</th>
                    <td>ゆうちょ銀行(金融機関コード9900)</td>
                  </tr>
                  <tr>
                    <th>加入者名</th>
                    <td>ノートセンディング</td>
                  </tr>
                  <tr>
                    <th>預金種目</th>
                    <td>普通</td>
                  </tr>
                  <tr>
                    <th>支店番号･支店名</th>
                    <td>078(〇七八)</td>
                  </tr>
                  <tr>
                    <th>口座番号</th>
                    <td>3081453</td>
                  </tr>
                </tbody>
              </table>
              <Alert>
                ※払込みにかかる手数料は、お客様負担となります。
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
          <FormButton color="default" onClick={() => props.nextStep()} disabled={!!selectedType?.productInfo && !checkedPayment}>次へ進む</FormButton>
        </FormItem>
      </FormSection>

    </>
  )
}

export default Step3
