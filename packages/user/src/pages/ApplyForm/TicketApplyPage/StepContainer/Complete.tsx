import { MdInfo } from 'react-icons/md'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import AnchorButton from '../../../../components/Parts/AnchorButton'
import IconLabel from '../../../../components/Parts/IconLabel'
import type { SockbaseTicketAddedResult } from 'sockbase'

interface Props {
  addedResult: SockbaseTicketAddedResult | undefined
}
const Complete: React.FC<Props> = props => {
  return (
    <>
      <h1>お申し込みが完了しました</h1>
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

      <h2>チケットの使い方</h2>

      <h3>自分で使う場合</h3>
      <ol>
        <li>チケット情報ページを開き、「自分で使う」をクリックします。</li>
        <li>「チケットを表示」をクリックし、表示された画面を入口スタッフまでご提示ください。</li>
      </ol>

      <h3>他の方に譲渡する場合</h3>
      <ol>
        <li>チケット情報ページを開き、「他の方へ割り当てる」をクリックします。</li>
        <li>表示された URL を譲渡したい方へ渡します。</li>
        <li>参加者情報を入力していただきます。</li>
      </ol>

      <FormSection>
        <FormItem>
          <AnchorButton
            color="primary"
            href={`/dashboard/tickets/${props.addedResult?.hashId}`}
            rel="noreferrer"
            target="_blank">
            <IconLabel
              icon={<MdInfo />}
              label="チケット情報ページを開く" />
          </AnchorButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Complete
