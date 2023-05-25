import { Link } from 'react-router-dom'
import type { SockbaseEvent } from 'sockbase'

import FormButton from '../../../Form/Button'
import FormSection from '../../../Form/FormSection'
import FormItem from '../../../Form/FormItem'

interface Props {
  event: SockbaseEvent
  nextStep: () => void
}
const Introduction: React.FC<Props> = (props) => {
  return (
    <>
      <h1>申し込みの前に</h1>
      <p>
        このページでは「{props.event.eventName}」へのサークル参加申し込みを受け付けます。<br />
        申し込み手続きを進める前に以下の内容を確認してください。
      </p>

      <h2>当日までの流れ</h2>
      <h3>スケジュール</h3>
      <table>
        <tbody>
          <tr>
            <th>申し込み受付開始</th>
            <td>{new Date(props.event.schedules.startApplication).toLocaleString()}</td>
          </tr>
          <tr>
            <th>申し込み受付終了</th>
            <td>{new Date(props.event.schedules.endApplication).toLocaleString()}</td>
          </tr>
          <tr>
            <th>配置発表(予定)</th>
            <td>{new Date(props.event.schedules.publishSpaces).toLocaleString()}</td>
          </tr>
          <tr>
            <th>会期開始</th>
            <td>{new Date(props.event.schedules.startEvent).toLocaleString()}</td>
          </tr>
          <tr>
            <th>会期終了</th>
            <td>{new Date(props.event.schedules.endEvent).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      <h3>申し込み</h3>
      <h4>申し込み情報の入力</h4>
      <p>
        サークル参加に必要な情報を入力します。
      </p>
      <h4>サークル参加費のお支払い</h4>
      <p>
        参加費のお支払いには、クレジットカードを利用したオンライン決済のほか、銀行振込がご利用いただけます。
      </p>
      <p>
        銀行振込の場合、手数料は申し込み者様によるご負担となります。<br />
        また、お振込みの確認までにお時間をいただく場合がございます。
      </p>
      <h4>申し込み完了</h4>
      <p>
        決済が完了次第、申し込み完了となります。
      </p>

      <h3>申し込み完了後～当日</h3>
      <h4>配置発表・デジタル通行証発券</h4>
      <p>
        配置発表を {new Date(props.event.schedules.publishSpaces).toLocaleString()} に行う予定です。
      </p>
      <p>
        配置は、申し込み後にログインできる「申し込み履歴」のページからご確認いただけます。<br />
        配置発表と同時に、当日使用するデジタル通行証を発券いたしますので必ずご確認ください。
      </p>
      <h4>当日</h4>
      <p>
        当日は配置発表時に発券されたデジタル通行証を入り口のスタッフまでご提示ください。<br />
        デジタル通行証を表示できる端末をお持ちでない場合は、デジタル通行証のページから予め紙の通行証を印刷し、入り口スタッフまでご提示ください。
      </p>

      <h2>申し込みに必要なもの</h2>
      <h3>必須</h3>
      <ul>
        <li>サークルカット</li>
      </ul>
      <h3>隣接配置(合体)を希望する場合</h3>
      <ul>
        <li>先に申し込んだ方の合体申し込みID</li>
      </ul>
      <p>
      </p>

      <h3>プチオンリーに参加する場合</h3>
      <ul>
        <li>プチオンリー主催から提供されたプチオンリーコード</li>
      </ul>

      <h2>サークル参加費</h2>
      <p>
        このイベントのサークル参加費には以下の内容が含まれます。
      </p>
      <table>
        <thead>
          <tr>
            <th>スペース</th>
            <th>参加費</th>
            <th>詳細</th>
          </tr>
        </thead>
        <tbody>
          {
            props.event.spaces.map(i => <tr key={i.id}>
              <th>{i.name}</th>
              <td>{i.price.toLocaleString()}円</td>
              <td>{i.description}</td>
            </tr>)
          }
        </tbody>
      </table>
      <ul>

      </ul>

      <h2>注意事項</h2>
      <ul>
        {props.event.rules.map((i, k) => <li key={k}>{i}</li>)}
      </ul>

      <h2>申し込み管理システムについて</h2>
      <p>
        今回のイベントは、<a href="https://nectarition.jp">ねくたりしょん</a>が運用する「Sockbase」を利用しています。<br />
        イベントの内容に関するご質問は、イベント主催である「<a href={props.event._organization.contactUrl}>{props.event._organization.name}</a>」へ直接お問い合わせください。
      </p>
      {import.meta.env.VITE_SOCKBASE_MANAGE_ORGANIZATION_ID === props.event._organization.id
        ? <p>
          申し込み情報はプライバシーポリシーに則って管理いたします。
        </p>
        : <p>
          申し込み情報はねくたりしょんが保管し、イベント主催である「{props.event._organization.name}」に提供いたします。
        </p>}
      <p>
        詳しくは<Link to="/privacy-policy">プライバシーポリシー</Link>をご確認ください。
      </p>

      <FormSection>
        <FormItem>
          <FormButton onClick={() => props.nextStep()}>申し込みへ進む</FormButton>
        </FormItem>
      </FormSection>
    </>
  )
}

export default Introduction
