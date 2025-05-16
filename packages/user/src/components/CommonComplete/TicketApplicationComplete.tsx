import { useMemo } from 'react'
import { MdInfo } from 'react-icons/md'
import { Link } from 'react-router-dom'
import FormInput from '../Form/FormInput'
import FormItem from '../Form/FormItem'
import FormSection from '../Form/FormSection'
import AnchorButton from '../Parts/AnchorButton'
import CopyToClipboard from '../Parts/CopyToClipboard'
import IconLabel from '../Parts/IconLabel'

interface Props {
  hashId: string | undefined
  isOnlineCheckout?: boolean
}
const TicketApplicationComplete: React.FC<Props> = props => {
  const assignURL = useMemo(() =>
    (props.hashId && `${location.protocol}//${location.host}/assign-tickets?thi=${props.hashId}`) || '',
  [props.hashId])

  return (
    <>
      <h1>お申し込みが完了しました</h1>
      <p>
        お申し込みいただきましてありがとうございました。
      </p>
      <p>
        オンライン決済の場合、決済が完了してから 1 日程度で自動的に反映されます。<br />
        3 日経っても反映されない場合は、<Link to="/dashboard/contact/">こちら</Link>からお問い合わせください。
      </p>
      {!props.isOnlineCheckout && (
        <p>
        銀行振込の場合、お振込みいただいてから 1 週間程度お時間をいただくことがございます。<br />
        1 週間経っても反映されない場合は、<Link to="/dashboard/contact/">こちら</Link>からお問い合わせください。
        </p>
      )}

      <h2>チケットの使い方</h2>

      <h3>自分で使用する場合</h3>

      <ol>
        <li>マイページのメニューから「マイチケット」を選択します。</li>
        <li>使用したいチケットを選択します。</li>
        <li>「チケットを表示する」を選択し、表示された QR コードをスタッフにご提示ください。</li>
      </ol>

      <h3>他の方が使用する場合 (チケットの譲渡)</h3>

      <FormSection>
        <FormItem>
          チケットを渡したい方へ以下の URL を送付してください。
        </FormItem>
        <FormItem>
          <FormInput value={assignURL} />
        </FormItem>
        <FormItem>
          リンクをコピー <CopyToClipboard content={assignURL} />
        </FormItem>
      </FormSection>

      <FormSection>
        <FormItem>
          <AnchorButton
            color="primary"
            href="/dashboard/tickets"
            rel="noreferrer"
            target="_blank">
            <IconLabel
              icon={<MdInfo />}
              label="マイページを開く" />
          </AnchorButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default TicketApplicationComplete
