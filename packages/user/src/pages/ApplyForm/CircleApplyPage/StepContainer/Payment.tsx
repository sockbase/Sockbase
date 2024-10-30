import { useState } from 'react'
import { MdArrowForward } from 'react-icons/md'
import FormButton from '../../../../components/Form/Button'
import FormCheckbox from '../../../../components/Form/Checkbox'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import Alert from '../../../../components/Parts/Alert'
import AnchorButton from '../../../../components/Parts/AnchorButton'
import CopyToClipboard from '../../../../components/Parts/CopyToClipboard'
import IconLabel from '../../../../components/Parts/IconLabel'
import useDayjs from '../../../../hooks/useDayjs'
import type { User } from 'firebase/auth'
import type {
  SockbaseEventSpace,
  SockbaseApplicationAddedResult,
  SockbaseApplication,
  SockbaseEventDocument
} from 'sockbase'

interface Props {
  user: User | null | undefined
  event: SockbaseEventDocument | undefined
  app: SockbaseApplication | undefined
  addedResult: SockbaseApplicationAddedResult | undefined
  selectedSpace: SockbaseEventSpace | undefined
  nextStep: () => void
}
const Payment: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()
  const [checkedPayment, setCheckedPayment] = useState(false)

  return (
    <>
      <Alert type="success" title="申し込み情報の送信が完了しました">
        申し込み ID は「<b>{props.addedResult?.hashId}</b> <CopyToClipboard content={props.addedResult?.hashId ?? ''} />」です。
      </Alert>

      <p>
        お申し込みいただきましてありがとうございました。<br />
        申し込み内容の控えを入力していただいたメールアドレスに送信しましたのでご確認ください。
      </p>

      {props.selectedSpace?.productInfo && <>
        <h1>サークル参加費のお支払い</h1>
        <table>
          <tbody>
            <tr>
              <th>お支払い方法</th>
              <td>{props.app?.paymentMethod === 'online' ? 'オンライン決済' : '銀行振込'}</td>
            </tr>
            <tr>
              <th>スペース</th>
              <td>{props.selectedSpace.name}</td>
            </tr>
            <tr>
              <th>お支払い代金</th>
              <td>{props.selectedSpace.price.toLocaleString()}円</td>
            </tr>
            <tr>
              <th>お支払い期限</th>
              <td>{formatByDate((props.event?.schedules.endApplication ?? 0) - 1, 'YYYY/MM/DD')}</td>
            </tr>
            <tr>
              <th>お支払い補助番号</th>
              <td>{props.addedResult?.bankTransferCode}</td>
            </tr>
          </tbody>
        </table>

        <p>
          下に記載しているお支払い方法のご案内に従い、サークル参加費のお支払いをお願いいたします。<br />
          決済が完了すると「決済完了のお知らせ」メールをご登録いただいたメールアドレスに送付いたしますので、必ずご確認ください。<br />
          銀行振込の場合、振り込みの確認が完了するまで1週間ほどお時間をいただきます。予めご了承ください。
        </p>

        {props.app?.paymentMethod === 'online'
          ? <>
            <h2>オンライン決済でのお支払い</h2>
            <Alert type="warning" title="決済画面に表示されるメールアドレスは変更しないでください">
              決済画面のメールアドレスは自動入力されています。<br />
              変更した場合、決済確認ができなくなる可能性がありますので絶対に変更しないでください。
            </Alert>
            <p>
              「決済画面を開く」より決済を行ってください。
            </p>
            <FormSection>
              <FormItem>
                <AnchorButton
                  href={`${props.selectedSpace.productInfo.paymentURL}?prefilled_email=${encodeURIComponent(props.user?.email ?? '')}`}
                  target="_blank"
                  onClick={() => setCheckedPayment(true)}>決済画面を開く</AnchorButton>
              </FormItem>
            </FormSection>
          </>
          : <>
            <h2>銀行振込でのお支払い</h2>
            <p>
              {formatByDate((props.event?.schedules.endApplication ?? 0) - 1, 'YYYY/MM/DD')} までに以下の口座へ所定の金額のお振込みをお願いいたします。
            </p>
            <Alert type="warning" title="お支払い補助番号について">
              お振り込みの特定を容易にするため、ご依頼人名の先頭にお支払い補助番号「{props.addedResult?.bankTransferCode}」を入力してください。
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
            <Alert type="warning" title="振込みにかかる手数料は、サークル様のご負担となります。" />
            <FormSection>
              <FormCheckbox
                name="check-payment"
                label="振込情報を確認しました"
                checked={checkedPayment}
                onChange={checked => setCheckedPayment(checked)} />
            </FormSection>
          </>}
      </>}
      <FormSection>
        <FormItem>
          <FormButton
            color='default'
            onClick={props.nextStep}
            disabled={!checkedPayment}>
            <IconLabel icon={<MdArrowForward />} label="次へ進む" />
          </FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Payment
