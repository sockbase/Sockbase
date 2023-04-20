import type { SockbaseStore } from 'sockbase'
import sockbaseShared from '@sockbase/shared'

import FormButton from '../../../Form/Button'
import FormItem from '../../../Form/FormItem'
import FormSection from '../../../Form/FormSection'
import FormTextarea from '../../../Form/Textarea'
import FormLabel from '../../../Form/Label'
import FormRadio from '../../../Form/Radio'
import FormInput from '../../../Form/Input'
import Alert from '../../../Parts/Alert'
import FormCheckbox from '../../../Form/Checkbox'

interface Props {
  prevStep: () => void
  store: SockbaseStore
}
const Step1: React.FC<Props> = (props) => {
  return (
    <>
      <FormSection>
        <FormItem>
          <FormButton color="default" onClick={props.prevStep}>申し込み説明画面へ戻る</FormButton>
        </FormItem>
      </FormSection>

      <h2>申し込み種別</h2>
      <FormSection>
        <FormItem>
          <FormLabel>申し込み種別</FormLabel>
          <FormRadio
            name="types"
            values={
              props.store.types.map(t => ({
                text: `${t.name} ${t.price.toLocaleString()}円 / ${t.description}`,
                value: t.id
              }))
            } />
        </FormItem>
      </FormSection>

      <h2>参加者情報</h2>
      <p>
        申し込み責任者の方の情報をご入力ください。
      </p>
      <FormSection>
        <FormItem>
          <FormLabel>氏名</FormLabel>
          <FormInput />
        </FormItem>
        <FormItem>
          <FormLabel>生年月日</FormLabel>
          <FormInput type="date" />
        </FormItem>
        <FormItem>
          <FormLabel>郵便番号</FormLabel>
          <FormInput />
        </FormItem>
        <FormItem>
          <FormLabel>住所</FormLabel>
          <FormInput />
        </FormItem>
        <FormItem>
          <FormLabel>電話番号</FormLabel>
          <FormInput />
        </FormItem>
      </FormSection>

      <h2>Sockbaseログイン情報</h2>
      <p>
        申し込み情報の確認等に使用するアカウントを作成します。
      </p>
      <FormSection>
        <FormItem>
          <FormLabel>メールアドレス</FormLabel>
          <FormInput type="email" />
        </FormItem>
        <FormItem>
          <FormLabel>パスワード</FormLabel>
          <FormInput type="email" />
        </FormItem>
        <FormItem>
          <FormLabel>パスワード(確認)</FormLabel>
          <FormInput type="email" />
        </FormItem>
      </FormSection>

      <h2>参加費お支払い方法</h2>
      <FormSection>
        <FormItem>
          <table>
            <tbody>
              <tr>
                <th>申込むチケット</th>
                <td>あああ</td>
              </tr>
              <tr>
                <th>チケット詳細情報</th>
                <td>いいい</td>
              </tr>
              <tr>
                <th>お支払額</th>
                <td>ううう円</td>
              </tr>
            </tbody>
          </table>
        </FormItem>
        <FormItem>
          <FormRadio
            name="paymentMethod"
            values={
              sockbaseShared.constants.payment.methods
                .map(m => ({ value: m.id, text: m.description }))
            } />
        </FormItem>
        <FormItem>
          <Alert>
            銀行振込の場合、申し込み完了までお時間をいただくことがございます。
          </Alert>
        </FormItem>
      </FormSection>

      <h2>通信欄</h2>
      <p>
        申し込みにあたり運営チームへの要望等がありましたらご入力ください。
      </p>
      <FormSection>
        <FormItem>
          <FormTextarea></FormTextarea>
        </FormItem>
      </FormSection>

      <h2>注意事項</h2>
      <p>
        Sockbase利用規約およびプライバシーポリシーに同意しますか？
      </p>
      <FormSection>
        <FormItem>
          <FormCheckbox
            name="isAgreed"
            label="同意します" />
        </FormItem>
      </FormSection>

      <FormSection>
        <FormItem>
          <FormButton>入力内容確認画面へ進む</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Step1
