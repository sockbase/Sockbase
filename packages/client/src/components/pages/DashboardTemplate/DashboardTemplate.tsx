import Breadcrumbs from '../../Parts/Breadcrumbs'
import PageTitle from '../../Layout/Dashboard/PageTitle'
import Alert from '../../Parts/Alert'

import { MdEditNote } from 'react-icons/md'
import FormSection from '../../Form/FormSection'
import FormItem from '../../Form/Form'
import FormTextarea from '../../Form/Textarea'
import { useEffect, useState } from 'react'

const DashboardTemplate: React.FC = (props) => {
  const [textAreaValue, setTextAreaValue] = useState('')

  useEffect(() => console.log(textAreaValue.replaceAll(/\r?\n/g, '\\n')), [textAreaValue])

  return (
    <>
      <Breadcrumbs>
        <li><a href="">マイページ</a></li>
        <li>第二回しおばな祭</li>
      </Breadcrumbs>
      <PageTitle
        icon={<MdEditNote />}
        title="ねくたりしょん / Nectarition"
        description="サークル申し込み情報照会" />

      <Alert type="danger" title="決済が完了していません！">
        サークル参加費のお支払いが確認できておりません。<br />
        銀行振込でのお支払いの場合、運営の確認が完了するまでお時間がかかる場合がございます。
      </Alert>
      <Alert title="頒布物情報の事前入力へのご協力をお願いいたします。">
        サークル参加登録受付を円滑に進めるため、頒布物情報の事前入力(頒布物情報デジタル提出)へのご協力をお願いいたします。
      </Alert>

      <p>ここに何らかのマイページコンテンツが入ります</p>

      <FormSection>
        <FormItem>
          <FormTextarea value={textAreaValue} onChange={e => setTextAreaValue(e.target.value)} />
        </FormItem>
      </FormSection>
    </>
  )
}

export default DashboardTemplate
