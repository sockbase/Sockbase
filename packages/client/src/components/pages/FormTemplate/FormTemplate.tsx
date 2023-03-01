import StepProgress from '../../Parts/StepProgress'

import FormItem from '../../Form/FormItem'
import FormInput from '../../Form/Input'
import FormLabel from '../../Form/Label'
import FormHelp from '../../Form/Help'
import FormRadio from '../../Form/Radio'
import FormSelect from '../../Form/Select'
import FormButton from '../../Form/Button'
import FormSection from '../../Form/FormSection'

const FormTemplate: React.FC = (props) => {
  return (
    <>
      <h1>第二回しおばな祭 サークル申込み受付</h1>
      <p>ここにお好きなテキストを入力してください。テキストを入力した後は合成ボタンをクリックしてください。</p>

      <StepProgress steps={
        [
          {
            text: '入力',
            isActive: true
          },
          {
            text: '確認',
            isActive: false
          },
          {
            text: '決済',
            isActive: false
          },
          {
            text: '完了',
            isActive: false
          }
        ]
      } />

      <h2>申込みスペース数</h2>
      <p>ここにお好きなテキストを入力してください。テキストを入力した後は合成ボタンをクリックしてください。</p>
      <FormSection>
        <FormItem>
          <FormLabel>スペース数</FormLabel>
          <FormRadio
            name="space"
            values={[
              {
                text: '1スペース',
                value: '1',
                checked: true
              },
              {
                text: '2スペース',
                value: '2',
                checked: false
              }
            ]}
            onChange={e => alert(e)}
            value="" />
        </FormItem>
      </FormSection>

      <h2>サークル情報</h2>
      <FormSection>
        <FormItem>
          <FormLabel>サークル名</FormLabel>
          <FormInput />
        </FormItem>

        <FormItem>
          <FormLabel>サークル名よみ</FormLabel>
          <FormInput />
          <FormHelp>
            ひらがなのみで入力してください。
          </FormHelp>
        </FormItem>

        <FormItem>
          <FormLabel>ペンネーム</FormLabel>
          <FormInput />
        </FormItem>

        <FormItem>
          <FormLabel>ペンネームよみ</FormLabel>
          <FormInput />
          <FormHelp>
            ひらがなのみで入力してください。
          </FormHelp>
        </FormItem>

        <FormItem>
          <FormLabel>成人向け頒布物の有無</FormLabel>
          <FormSelect>
            <option>選択してください</option>
            <option>成人向け頒布物はありません</option>
            <option>成人向け頒布物があります</option>
          </FormSelect>
        </FormItem>
      </FormSection>

      <h2>サークルカット</h2>
      <p>ここにお好きなテキストを入力してください。テキストを入力した後は合成ボタンをクリックしてください。</p>
      <FormSection>
        <FormItem>
          <FormLabel>サークルカット</FormLabel>
          <FormInput type="file" />
        </FormItem>
      </FormSection>

      <h2>申込み責任者情報</h2>
      <FormSection>
        <FormItem>
          <FormLabel>申込み責任者氏名</FormLabel>
          <FormInput />
        </FormItem>

        <FormItem>
          <FormLabel>メールアドレス</FormLabel>
          <FormInput type="email" />
          <FormHelp>
            受信できるメールアドレスを入力してください。
          </FormHelp>
        </FormItem>

        <FormItem>
          <FormLabel>Sockbase ログインパスワード</FormLabel>
          <FormInput type="password" />
          <FormHelp>
            よしなに書く
          </FormHelp>
        </FormItem>

        <FormItem>
          <FormLabel>Sockbase ログインパスワード(再入力)</FormLabel>
          <FormInput type="password" />
        </FormItem>
      </FormSection>

      <FormSection>
        <FormItem>
          <FormButton>入力内容確認</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default FormTemplate
