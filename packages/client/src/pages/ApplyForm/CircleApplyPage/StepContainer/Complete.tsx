import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import AnchorButton from '../../../../components/Parts/AnchorButton'
import LinkButton from '../../../../components/Parts/LinkButton'
import type { SockbaseApplicationAddedResult, SockbaseEventDocument } from 'sockbase'

interface Props {
  event: SockbaseEventDocument | undefined
  addedResult: SockbaseApplicationAddedResult | undefined
}
const Complete: React.FC<Props> = (props) => {
  return (
    <>
      <h2>申し込みが完了しました</h2>
      <p>
        お申し込みいただきましてありがとうございました。
      </p>
      <p>
        オンライン決済の場合、決済が完了してから 1 日程度で自動的に反映されます。<br />
        3 日経っても反映されない場合は、こちらからお問い合わせください。
      </p>
      <p>
        銀行振込の場合、お振込みいただいてから 1 週間程度お時間をいただくことがございます。<br />
        1 週間経っても反映されない場合は、こちらからお問い合わせください。
      </p>

      <FormSection>
        <FormItem>
          <LinkButton color="default" to={`/dashboard/applications/${props.addedResult?.hashId}`}>
            マイページを開く
          </LinkButton>
        </FormItem>
        <FormItem>
          <AnchorButton href={props.event?.eventWebURL}>
            イベントサイトへ戻る
          </AnchorButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Complete
