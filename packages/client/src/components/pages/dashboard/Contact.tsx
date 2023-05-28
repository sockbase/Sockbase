import { MdMail } from 'react-icons/md'

import FormSection from '../../Form/FormSection'
import PageTitle from '../../Layout/Dashboard/PageTitle'
import FormItem from '../../Form/FormItem'
import FormLabel from '../../Form/Label'
import FormTextarea from '../../Form/Textarea'
import FormSelect from '../../Form/Select'
import FormButton from '../../Form/Button'
import FormInput from '../../Form/Input'

const contactTypes = [
  {
    id: 'other',
    name: 'その他'
  }
]

const Contact: React.FC = () => {
  return (
    <>
      <PageTitle icon={<MdMail />} title="お問い合わせ" description="Sockbase運営チームへのお問い合わせはこちらから" />
      <FormSection>
        <FormItem>
          <FormLabel>お名前</FormLabel>
          <FormInput disabled value='お名前' />
        </FormItem>
        <FormItem>
          <FormLabel>ご返信先メールアドレス</FormLabel>
          <FormInput disabled value='example@sockbase.net' />
        </FormItem>
        <FormItem>
          <FormLabel>お問い合わせ種類</FormLabel>
          <FormSelect>
            <option>お問い合わせ内容を選択してください</option>
            {contactTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
          </FormSelect>
        </FormItem>
        <FormItem>
          <FormLabel>お問い合わせ内容</FormLabel>
          <FormTextarea />
        </FormItem>
      </FormSection>

      <p>
        返信はメールにて行います。<br />
        迷惑メール設定にてドメイン規制設定を行なっている方は、受信許可ドメインに<code>@sockbase.net</code>を追加してください。
      </p>
      <FormSection>
        <FormItem>
          <FormButton inlined>送信</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Contact
