import { type SockbaseStoreDocument } from 'sockbase'
import FormItem from '../../../Form/FormItem'
import FormSection from '../../../Form/FormSection'
import LinkButton from '../../../Parts/LinkButton'

interface Props {
  store: SockbaseStoreDocument
}
const Step4: React.FC<Props> = (props) => {
  return (
    <>
      <h1>お申し込みが完了しました</h1>
      <p>
        お申し込みいただきましてありがとうございました。
      </p>
      <p>
        オンライン決済の場合、決済が完了してから1日程度で自動的に反映されます。<br />
        3日経っても反映されない場合は、こちらからお問い合わせください。
      </p>
      <p>
        銀行振込の場合、お振込みいただいてから1週間程度お時間をいただくことがございます。<br />
        1週間経っても反映されない場合は、こちらからお問い合わせください。
      </p>
      <FormSection>
        <FormItem>
          {/* <LinkButton color="default" to={`/dashboard/applications/${props.appResult.hashId}`}>マイページを開く</LinkButton> */}
        </FormItem>
        <FormItem>
          <LinkButton to={props.store.storeWebURL}>イベントサイトへ戻る</LinkButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Step4
