import { useMemo } from 'react'
import { type SockbaseTicketUserDocument, type SockbaseStoreDocument } from 'sockbase'
import FormItem from '../../../Form/FormItem'
import FormSection from '../../../Form/FormSection'
import AnchorButton from '../../../Parts/AnchorButton'
import LinkButton from '../../../Parts/LinkButton'

interface Props {
  ticketHashId: string
  store: SockbaseStoreDocument
  ticketUser: SockbaseTicketUserDocument
}
const Step3: React.FC<Props> = (props) => {
  const typeName = useMemo(() => {
    if (!props.store || !props.ticketUser) return ''

    const type = props.store.types
      .filter(t => t.id === props.ticketUser.typeId)[0]
    return type.name
  }, [props.store, props.ticketUser])

  return (
    <>
      <h1>チケットを受け取りました</h1>
      <p>
        {props.store.storeName}({typeName}) を受け取りました。
      </p>

      <h2>使用方法</h2>
      <p>
        マイページの「マイチケット」より受け取ったチケットを使用することができます。
      </p>
      <p>
        表示されたQRコードを入口スタッフまでご提示ください。
      </p>
      <p>
        提示できない場合、表示されたQRコードを印刷し、ご持参ください。
      </p>

      <h2>関連リンク</h2>
      <FormSection>
        <FormItem>
          <LinkButton to={`/dashboard/mytickets/${props.ticketHashId}`}>チケット情報を確認する</LinkButton>
        </FormItem>
        <FormItem>
          <AnchorButton href={`/tickets/${props.ticketHashId}`} target="_blank" rel="noreferrer" color="default">チケット画面を開く</AnchorButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Step3
