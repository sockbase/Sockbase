import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import LinkButton from '../../../components/Parts/LinkButton'
import type { SockbaseApplicationAddedResult } from 'sockbase'

interface Props {
  appResult?: SockbaseApplicationAddedResult
}
const Step4: React.FC<Props> = (props) => {
  return (
    props.appResult
      ? <>
        <h2>申し込みが完了しました</h2>
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
            <LinkButton color="default" to={`/dashboard/applications/${props.appResult.hashId}`}>マイページを開く</LinkButton>
          </FormItem>
          <FormItem>
            <LinkButton to="">イベントサイトへ戻る</LinkButton>
          </FormItem>
        </FormSection>
      </>
      : <></>
  )
}

export default Step4
