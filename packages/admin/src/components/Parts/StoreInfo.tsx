import useDayjs from '../../hooks/useDayjs'
import TicketTypeLabel from '../StatusLabel/TicketTypeLabel'
import Alert from './Alert'
import type { SockbaseStore } from 'sockbase'

interface Props {
  storeId: string | null | undefined
  store: SockbaseStore | null | undefined
}
const StoreInfo: React.FC<Props> = props => {
  const { formatByDate } = useDayjs()

  return (
    <>
      {props.store && (props.store.isPublic
        ? (
          <Alert
            title="チケットストア: 公開"
            type="success" />
        )
        : (
          <Alert
            title="チケットストア: 非公開"
            type="warning" />
        ))}

      <h3>チケットストア基礎情報</h3>
      <table>
        <tbody>
          <tr>
            <th>チケットストア ID</th>
            <td>{props.storeId}</td>
          </tr>
          <tr>
            <th>チケットストア名</th>
            <td>{props.store?.name}</td>
          </tr>
          <tr>
            <th>イベント Web サイト</th>
            <td>{props.store?.websiteURL}</td>
          </tr>
          <tr>
            <th>会場名</th>
            <td>{props.store?.venue?.name || '(空欄)'}</td>
          </tr>
        </tbody>
      </table>

      <h3>組織情報</h3>
      <table>
        <tbody>
          <tr>
            <th>組織 ID</th>
            <td>{props.store?._organization.id}</td>
          </tr>
          <tr>
            <th>組織名</th>
            <td>{props.store?._organization.name}</td>
          </tr>
          <tr>
            <th>連絡先 URL</th>
            <td>{props.store?._organization.contactUrl}</td>
          </tr>
        </tbody>
      </table>

      <h3>全体スケジュール</h3>
      <table>
        <tbody>
          <tr>
            <th>申し込み受付開始</th>
            <td>{formatByDate(props.store?.schedules.startApplication, 'YYYY年 M月 D日 H時mm分')}</td>
          </tr>
          <tr>
            <th>申し込み受付終了</th>
            <td>{formatByDate((props.store?.schedules.endApplication ?? 0) - 1, 'YYYY年 M月 D日 H時mm分')}</td>
          </tr>
          <tr>
            <th>イベント開始</th>
            <td>{formatByDate(props.store?.schedules.startEvent, 'YYYY年 M月 D日 H時mm分')}</td>
          </tr>
          <tr>
            <th>イベント終了</th>
            <td>{formatByDate(props.store?.schedules.endEvent, 'YYYY年 M月 D日 H時mm分')}</td>
          </tr>
        </tbody>
      </table>

      <h3>チケットタイプ</h3>
      <table>
        <thead>
          <tr>
            <th style={{ width: '10%' }}>タイプ ID</th>
            <th style={{ width: '25%' }}>タイプ名</th>
            <th style={{ width: '25%' }}>説明</th>
            <th style={{ width: '20%' }}>価格</th>
            <th>アナザーチケットストア ID</th>
            <th>アナザーチケットタイプ ID</th>
            <th>公開？</th>
          </tr>
        </thead>
        <tbody>
          {props.store?.types.length
            ? props.store.types.map((t, i) => (
              <tr key={i}>
                <td>{t.id}</td>
                <td><TicketTypeLabel
                  store={props.store}
                  typeId={t.id} />
                </td>
                <td>{t.description}</td>
                <td>{t.price.toLocaleString()}円</td>
                <td>{t.anotherTicket?.storeId}</td>
                <td>{t.anotherTicket?.typeId}</td>
                <td>{t.isPublic ? '公開' : '非公開'}</td>
              </tr>
            ))
            : (
              <tr>
                <td colSpan={8}>チケットタイプ情報が入力されていません</td>
              </tr>
            )}
        </tbody>
      </table>

      <h3>各種事項</h3>
      <table>
        <tbody>
          <tr>
            <th>注意事項</th>
            <td>
              <ul>
                {props.store?.rules.length
                  ? props.store?.rules.map((r, i) => <li key={i}>{r}</li>)
                  : <li>注意事項が入力されていません</li>}
              </ul>
            </td>
          </tr>
          <tr>
            <th>申し込み説明</th>
            <td>
              <ul>
                {props.store?.descriptions.length
                  ? props.store?.descriptions.map((d, i) => <li key={i}>{d}</li>)
                  : <li>申し込み説明が入力されていません</li>}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>

      <h3>制限設定</h3>
      <table>
        <tbody>
          <tr>
            <th>参加費の銀行振込を許可</th>
            <td>{props.store?.permissions.canUseBankTransfer ? '許可する' : '許可しない'}</td>
          </tr>
          <tr>
            <th>チケット使用者の割り当て</th>
            <td>{props.store?.permissions.ticketUserAutoAssign ? '自動' : '手動'}</td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

export default StoreInfo
