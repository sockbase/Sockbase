import { useMemo, useState } from 'react'
import { type SockbaseTicketUserDocument, type SockbaseStoreDocument } from 'sockbase'
import FormButton from '../../../Form/Button'
import FormItem from '../../../Form/FormItem'
import FormSection from '../../../Form/FormSection'
import useDayjs from '../../../../hooks/useDayjs'
import FormCheckbox from '../../../Form/Checkbox'

interface Props {
  store: SockbaseStoreDocument
  ticketUser: SockbaseTicketUserDocument
  nextStep: () => void
}
const Step1: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()

  const [isAgreed, setAgreed] = useState(false)

  const typeName = useMemo(() => {
    if (!props.store || !props.ticketUser) return ''

    const type = props.store.types
      .filter(t => t.id === props.ticketUser.typeId)[0]
    return type.name
  }, [props.store, props.ticketUser])

  return (
    <>
      <h2>イベント情報</h2>
      <table>
        <tbody>
          <tr>
            <th>チケット名</th>
            <td>{props.store.storeName}</td>
          </tr>
          <tr>
            <th>参加種別</th>
            <td>{typeName}</td>
          </tr>
          <tr>
            <th>開催日時</th>
            <td>{formatByDate(props.store.schedules.startEvent, 'YYYY年M月D日 H:mm')} ～ {formatByDate(props.store.schedules.endEvent, 'H:mm')}</td>
          </tr>
          <tr>
            <th></th>
            <td>
              <a href={props.store.storeWebURL} target="_blank" rel="noreferrer">その他の開催情報…</a>
            </td>
          </tr>
        </tbody>
      </table>

      <h2>使用者情報</h2>

      <p>
        現在ログイン中のユーザ情報を引き継ぎます。
      </p>

      <h2>注意事項</h2>
      <p>
        <a href="/tos" target="_blank">Sockbase利用規約</a>および<a href="/privacy-policy" target="_blank">プライバシーポリシー</a>に同意しますか？
      </p>

      <FormSection>
        <FormItem>
          <FormCheckbox
            name="isAggreed"
            label="同意します"
            onChange={(agreement) => setAgreed(agreement)}
            checked={isAgreed} />
        </FormItem>
      </FormSection>

      <FormSection>
        <FormItem>
          <FormButton onClick={() => props.nextStep()} disabled={!isAgreed}>入力内容確認画面へ進む</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Step1
