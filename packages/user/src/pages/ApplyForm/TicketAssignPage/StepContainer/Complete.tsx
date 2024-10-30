import { MdBookOnline, MdInfo } from 'react-icons/md'
import FormItem from '../../../../components/Form/FormItem'
import FormSection from '../../../../components/Form/FormSection'
import AnchorButton from '../../../../components/Parts/AnchorButton'
import IconLabel from '../../../../components/Parts/IconLabel'
import LinkButton from '../../../../components/Parts/LinkButton'
import type { SockbaseStoreDocument, SockbaseStoreType } from 'sockbase'

interface Props {
  ticketHashId: string
  store: SockbaseStoreDocument
  selectedType: SockbaseStoreType
}
const Complete: React.FC<Props> = (props) => {
  return (
    <>
      <h1>チケットを受け取りました</h1>

      <p>
        {props.store.name} ({props.selectedType.name}) を受け取りました。
      </p>

      <h2>使用方法</h2>
      <p>
        マイページの「マイチケット」より受け取ったチケットを使用することができます。
      </p>
      <p>
        表示された QR コードを入口スタッフまでご提示ください。
      </p>
      <p>
        提示できない場合、表示されたQRコードを印刷し、ご持参ください。
      </p>

      <h2>関連リンク</h2>
      <FormSection>
        <FormItem $inlined>
          <LinkButton
            color="primary"
            to={`/dashboard/mytickets/${props.ticketHashId}`}>
            <IconLabel icon={<MdInfo />} label="チケット情報を確認する" />
          </LinkButton>
          <AnchorButton href={`/tickets/${props.ticketHashId}`} target="_blank">
            <IconLabel icon={<MdBookOnline />} label="チケット画面を開く" />
          </AnchorButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Complete
