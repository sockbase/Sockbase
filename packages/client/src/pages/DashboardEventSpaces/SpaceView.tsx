import { Link } from 'react-router-dom'

interface Props {
  eventId: string
}
const SpaceView: React.FC<Props> = (props) => {
  return (
    <>
      <p>
        配置は完了しています
      </p>

      <table>
        <thead>
          <tr>
            <th>スペース</th>
            <th>サークル</th>
            <th>ペンネーム</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th colSpan={3}>
              配置情報の表示は未実装です<br />
              <Link to={`/dashboard/events/${props.eventId}`}>申し込み一覧</Link>を確認してください
            </th>
          </tr>
        </tbody>
      </table>
    </>
  )
}

export default SpaceView
