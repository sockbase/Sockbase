import useDayjs from '../../hooks/useDayjs'
import Alert from './Alert'
import EyecatchPreview from './EyecatchPreview'
import type { SockbaseEvent } from 'sockbase'

interface Props {
  eventId: string | null | undefined
  event: SockbaseEvent | null | undefined
  eyecatchData: string | null | undefined
}
const EventInfo: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()

  return (
    <>
      {props.event && (props.event.isPublic
        ? <Alert type="success">イベントは公開されます</Alert>
        : <Alert type="danger">イベントは公開されません</Alert>)}

      <h3>イベント基礎情報</h3>
      <table>
        <tbody>
          <tr>
            <th>イベント ID</th>
            <td>{props.eventId || '(空欄)'}</td>
          </tr>
          <tr>
            <th>イベント名</th>
            <td>{props.event?.name || '(空欄)'}</td>
          </tr>
          <tr>
            <th>イベント Web サイト</th>
            <td>{props.event?.websiteURL || '(空欄)'}</td>
          </tr>
          <tr>
            <th>会場名</th>
            <td>{props.event?.venue.name || '(空欄)'}</td>
          </tr>
          <tr>
            <th>アイキャッチ画像</th>
            <td>{(props.eyecatchData && <EyecatchPreview src={props.eyecatchData}/>) || '(未指定)'}</td>
          </tr>
        </tbody>
      </table>

      <h3>組織情報</h3>
      <table>
        <tbody>
          <tr>
            <th>組織 ID</th>
            <td>{props.event?._organization.id || '(空欄)'}</td>
          </tr>
          <tr>
            <th>組織名</th>
            <td>{props.event?._organization.name || '(空欄)'}</td>
          </tr>
          <tr>
            <th>連絡先 URL</th>
            <td>{props.event?._organization.contactUrl || '(空欄)'}</td>
          </tr>
        </tbody>
      </table>

      <h3>サークル通行証情報</h3>
      <table>
        <tbody>
          <tr>
            <th>チケットストア ID</th>
            <td>{props.event?.passConfig?.storeId || '(空欄)'}</td>
          </tr>
          <tr>
            <th>チケットタイプ ID</th>
            <td>{props.event?.passConfig?.typeId || '(空欄)'}</td>
          </tr>
        </tbody>
      </table>

      <h3>全体スケジュール</h3>
      <table>
        <tbody>
          <tr>
            <th>申し込み受付開始</th>
            <td>{formatByDate(props.event?.schedules.startApplication, 'YYYY年 M月 D日 H時mm分')}</td>
          </tr>
          <tr>
            <th>申し込み受付終了</th>
            <td>{formatByDate((props.event?.schedules.endApplication ?? 0) - 1, 'YYYY年 M月 D日 H時mm分')}</td>
          </tr>
          <tr>
            <th>配置情報締切</th>
            <td>{formatByDate((props.event?.schedules.overviewFirstFixedAt ?? 0) - 1, 'YYYY年 M月 D日 H時mm分')}</td>
          </tr>
          <tr>
            <th>配置発表</th>
            <td>{formatByDate(props.event?.schedules.publishSpaces, 'YYYY年 M月 D日 H時mm分')}</td>
          </tr>
          <tr>
            <th>カタログ掲載情報締切</th>
            <td>{formatByDate((props.event?.schedules.catalogInformationFixedAt ?? 0) - 1, 'YYYY年 M月 D日 H時mm分')}</td>
          </tr>
          <tr>
            <th>頒布物情報更新締切</th>
            <td>{formatByDate((props.event?.schedules.overviewFinalFixedAt ?? 0) - 1, 'YYYY年 M月 D日 H時mm分')}</td>
          </tr>
          <tr>
            <th>イベント開始</th>
            <td>{formatByDate(props.event?.schedules.startEvent, 'YYYY年 M月 D日 H時mm分')}</td>
          </tr>
          <tr>
            <th>イベント終了</th>
            <td>{formatByDate(props.event?.schedules.endEvent, 'YYYY年 M月 D日 H時mm分')}</td>
          </tr>
        </tbody>
      </table>

      <h3>ジャンル</h3>
      <table>
        <thead>
          <tr>
            <th style={{ width: '25%' }}>ジャンル ID</th>
            <th>ジャンル名</th>
          </tr>
        </thead>
        <tbody>
          {props.event?.genres.length
            ? props.event?.genres.map((g, i) => <tr key={i}>
              <td>{g.id}</td>
              <td>{g.name}</td>
            </tr>)
            : <tr>
              <td colSpan={2}>ジャンル情報が入力されていません</td>
            </tr>}
        </tbody>
      </table>

      <h3>スペース</h3>
      <table>
        <thead>
          <tr>
            <th style={{ width: '10%' }}>スペース ID</th>
            <th style={{ width: '20%' }}>名前</th>
            <th style={{ width: '30%' }}>説明</th>
            <th>参加費</th>
            <th>支払いURL</th>
            <th>商品 ID</th>
            <th>通行証発券枚数</th>
            <th>2 スペース</th>
            <th>受入</th>
          </tr>
        </thead>
        <tbody>
          {props.event?.spaces.length
            ? props.event.spaces.map((s, i) => <tr key={i}>
              <td>{s.id}</td>
              <td>{s.name}</td>
              <td>{s.description}</td>
              <td>{s.price.toLocaleString()}円</td>
              <td>{s.productInfo?.paymentURL}</td>
              <td>{s.productInfo?.productId}</td>
              <td>{s.passCount?.toLocaleString() ?? 0}枚</td>
              <td>{s.isDualSpace ? '2 スペース' : '-'}</td>
              <td>{s.acceptApplication ? '受入' : '-'}</td>
            </tr>)
            : <tr>
              <td colSpan={6}>スペース情報が入力されていません</td>
            </tr>}
        </tbody>
      </table>

      <h3>各種事項</h3>
      <table>
        <tbody>
          <tr>
            <th>注意事項</th>
            <td>
              <ul>
                {props.event?.rules.length
                  ? props.event?.rules.map((r, i) => <li key={i}>{r}</li>)
                  : <li>注意事項が入力されていません</li>}
              </ul>
            </td>
          </tr>
          <tr>
            <th>申し込み説明</th>
            <td>
              <ul>
                {props.event?.descriptions.length
                  ? props.event?.descriptions.map((d, i) => <li key={i}>{d}</li>)
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
            <th>成人向け作品の頒布</th>
            <td>{props.event?.permissions.allowAdult ? '許可する' : '許可しない'}</td>
          </tr>
          <tr>
            <th>参加費の銀行振込を許可</th>
            <td>{props.event?.permissions.canUseBankTransfer ? '許可する' : '許可しない'}</td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

export default EventInfo
