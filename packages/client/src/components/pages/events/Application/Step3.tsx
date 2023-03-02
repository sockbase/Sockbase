import FormButton from '../../../Form/Button'
import FormItem from '../../../Form/FormItem'
import FormSection from '../../../Form/FormSection'
import Alert from '../../../Parts/Alert'

interface Props {
  nextStep: () => void
}
const Step3: React.FC<Props> = (props) => {
  return (
    <>
      <Alert type="info" title="申し込み情報の送信が完了しました">
        申し込みIDは  です。
      </Alert>
      <p>
        お申し込みいただきましてありがとうございました。<br />
        申し込み内容の控えを入力していただいたメールアドレスに送信しましたのでご確認ください。
      </p>

      <h1>サークル参加費のお支払い</h1>
      <p>
        ここに支払金額の情報(スペースのアレ)
      </p>
      <p>
        paymentMethodでswitchする。
      </p>

      <h2>オンライン決済でのお支払い</h2>
      <FormSection>
        <FormItem>
          <FormButton>決済画面を開く</FormButton>
        </FormItem>
      </FormSection>

      <h2>銀行振込でのお支払い</h2>
      <p>
        までに以下の口座へ所定の金額のお振込みをお願いいたします。<br />
        オンライン決済への変更を希望される場合は、こちらのページから決済してください。
      </p>

      <h3>ゆうちょ銀行からお振込みの場合</h3>
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
            <th>口座記号･口座番号</th>
            <td>10740-30814531</td>
          </tr>
          <tr>
            <th>ご依頼人名</th>
            <td>
              スペース数(数字のみ) お名前(カタカナ)
              <br />
              例: 1 ソメミヤネイロ
            </td>
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
          <tr>
            <th>ご依頼人名</th>
            <td>
              スペース数(数字のみ) お名前(カタカナ)
              <br />
              例: 1 ソメミヤネイロ
            </td>
          </tr>
        </tbody>
      </table>
      <Alert>
        ※払込みにかかる手数料は、サークル様のご負担となります。<br />
      </Alert>

      <FormSection>
        <FormItem>
          <FormButton onClick={() => props.nextStep()}>次へ進む</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Step3
