import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import AnchorButton from '../../../../components/Parts/AnchorButton'
import LinkButton from '../../../../components/Parts/LinkButton'
import useDayjs from '../../../../hooks/useDayjs'
import type { SockbaseApplicationAddedResult, SockbaseEventDocument } from 'sockbase'

interface Props {
  event: SockbaseEventDocument | undefined
  addedResult: SockbaseApplicationAddedResult | undefined
}
const Complete: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()

  return (
    <>
      <h1>申し込みが完了しました</h1>
      <p>
        お申し込みいただきましてありがとうございました。
      </p>

      <h2>サークルカットの提出・差し替え</h2>
      <p>
        サークルカットの提出・差し替えは「申し込み内容確認ページ」から行うことができます。<br />
        {formatByDate((props.event?.schedules.catalogInformationFixedAt ?? 0) - 1, 'YYYY年 M月 D日')}時点の情報を元にカタログ等を制作いたしますので、変更がある場合はこの日までにご提出いただくようお願いいたします。
      </p>

      <FormSection>
        <FormItem>
          <LinkButton to={`/dashboard/applications/${props.addedResult?.hashId}`}>
            申し込み内容を確認する
          </LinkButton>
        </FormItem>
        <FormItem>
          <AnchorButton color="default" href={props.event?.websiteURL}>
            イベントサイトへ戻る
          </AnchorButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Complete
