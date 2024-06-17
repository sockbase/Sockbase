import { useMemo, useState } from 'react'

import FormButton from '../../../../components/Form/Button'
import FormCheckbox from '../../../../components/Form/Checkbox'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import Alert from '../../../../components/Parts/Alert'
import AnchorButton from '../../../../components/Parts/AnchorButton'
import CopyToClipboard from '../../../../components/Parts/CopyToClipboard'
import type { SockbaseApplication, SockbaseApplicationAddedResult, SockbaseEvent } from 'sockbase'

interface Props {
  appResult?: SockbaseApplicationAddedResult
  app: SockbaseApplication | undefined
  event: SockbaseEvent
  email: string | undefined
  nextStep: () => void
}
const Step3: React.FC<Props> = (props) => {
  const [checkedPayment, setCheckedPayment] = useState(false)

  const space = useMemo(() => {
    if (!props.app) return undefined

    return props.event.spaces
      .filter(s => s.id === props.app?.spaceId)[0]
  }, [props.event, props.app])

  return (
    props.appResult && props.app && props.event && space && props.email
      ? <>
        <Alert type="success" title="申し込み情報の送信が完了しました">
          申し込みIDは「<b>{props.appResult.hashId}</b> <CopyToClipboard content={props.appResult.hashId} />」です。
        </Alert>
        <p>
          お申し込みいただきましてありがとうございました。<br />
          申し込み内容の控えを入力していただいたメールアドレスに送信しましたのでご確認ください。
        </p>
        {
          space.productInfo &&
          <>
            <h1>サークル参加費のお支払い</h1>
            <table>
              <tbody>
                <tr>
                  <th>お支払い方法</th>
                  <td>{props.app.paymentMethod === 'online' ? 'オンライン決済' : '銀行振込'}</td>
                </tr>
                <tr>
                  <th>スペース</th>
                  <td>{space.name}</td>
                </tr>
                <tr>
                  <th>お支払い代金</th>
                  <td>{space.price.toLocaleString()}円</td>
                </tr>
                <tr>
                  <th>お支払い期限</th>
                  <td>{new Date(props.event.schedules.endApplication).toLocaleString()}</td>
                </tr>
                <tr>
                  <th>お支払い補助番号</th>
                  <td>{props.appResult.bankTransferCode}</td>
                </tr>
              </tbody>
            </table>

            <p>
              下に記載しているお支払い方法のご案内に従い、サークル参加費のお支払いをお願いいたします。<br />
              決済が完了すると「決済完了のお知らせ」メールをご登録いただいたメールアドレスに送付いたしますので、必ずご確認ください。<br />
              銀行振込の場合、振り込みの確認が完了するまで1週間ほどお時間をいただきます。予めご了承ください。
            </p>

            {props.app.paymentMethod === 'online'
              ? <>
                <h2>オンライン決済でのお支払い</h2>
                <Alert>
                  メールアドレスは自動で入力されます。<br />
                  別のメールアドレスを入力すると、お支払いの確認までお時間をいただく場合がございますので、<b>絶対に変更しないでください。</b>
                </Alert>
                <p>
                  「決済画面を開く」より決済を行ってください。
                </p>
                <FormSection>
                  <FormItem>
                    <AnchorButton
                      href={`${space.productInfo.paymentURL}?prefilled_email=${encodeURIComponent(props.email ?? '')}`}
                      target="_blank"
                      onClick={() => setCheckedPayment(true)}>決済画面を開く</AnchorButton>
                  </FormItem>
                </FormSection>
              </>
              : <>
                <h2>銀行振込でのお支払い</h2>
                <p>
                  {new Date(props.event.schedules.endApplication).toLocaleString()}までに以下の口座へ所定の金額のお振込みをお願いいたします。
                </p>
                <Alert>
                  お振り込みの特定を容易にするため、ご依頼人名の先頭にお支払い補助番号「{props.appResult.bankTransferCode}」を入力してください。
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
                  ※振込みにかかる手数料は、サークル様のご負担となります。
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
        }

        <FormSection>
          <FormItem>
            <FormButton color='default' onClick={() => props.nextStep()} disabled={!checkedPayment}>次へ進む</FormButton>
          </FormItem>
        </FormSection>
      </>
      : <></>)
}
export default Step3
