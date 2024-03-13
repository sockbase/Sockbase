import { type SockbaseStore } from 'sockbase'
import FormButton from '../../../components/Form/Button'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import useDayjs from '../../../hooks/useDayjs'

interface Props {
  store: SockbaseStore
  prevStep: () => void
  nextStep: () => void
}
const Introduction: React.FC<Props> = (props) => {
  const { formatByDate } = useDayjs()

  return (
    <>
      <FormSection>
        <FormItem>
          <FormButton color="default" onClick={props.prevStep}>アカウント確認画面へ戻る</FormButton>
        </FormItem>
      </FormSection>

      <h1>申し込みの前に</h1>

      <p>
        このページでは「{props.store.storeName}」のチケット申し込みを受け付けます。
      </p>

      <h2>当日までの流れ</h2>

      <h3>スケジュール</h3>

      <table>
        <tbody>
          <tr>
            <th>申し込み受付開始</th>
            <td>{formatByDate(props.store.schedules.startApplication, 'YYYY年M月D日 H時mm分')}</td>
          </tr>
          <tr>
            <th>申し込み受付終了</th>
            <td>{formatByDate(props.store.schedules.endApplication - 1, 'YYYY年M月D日 H時mm分')}</td>
          </tr>
          <tr>
            <th>会期開始</th>
            <td>{formatByDate(props.store.schedules.startEvent, 'YYYY年M月D日 H時mm分')}</td>
          </tr>
          <tr>
            <th>会期終了</th>
            <td>{formatByDate(props.store.schedules.endEvent, 'YYYY年M月D日 H時mm分')}</td>
          </tr>
        </tbody>
      </table>

      <h3>申し込み</h3>

      <h4>申し込み情報の入力</h4>

      <p>
        イベント参加に必要な情報を入力します。
      </p>

      <h4>参加費のお支払い</h4>

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

      <h4>申し込み完了後</h4>
      <p>
        申し込み後にログインできる「マイチケット」のページからチケット情報をご確認いただけます。
      </p>

      <h4>当日</h4>

      <p>
        当日は、チケット画面を入口スタッフまでご提示ください。<br />
        チケット画面を表示できる端末をお持ちでない場合は、チケット画面のページから予め紙の通行証を印刷し、入り口スタッフまでご提示ください。
      </p>

      <h2>参加費</h2>
      <p>
        このイベントの参加費には以下の内容が含まれます。
      </p>

      <table>
        <thead>
          <tr>
            <th>種類</th>
            <th>参加費</th>
            <th>詳細</th>
          </tr>
        </thead>
        <tbody>
          {
            props.store.types
              .filter(t => !t.private)
              .map(t => <tr key={t.id}>
                <th>{t.name}</th>
                <td>{t.price.toLocaleString()}円</td>
                <td>{t.description}</td>
              </tr>)
          }
        </tbody>
      </table>

      <h2>注意事項</h2>
      <ul>
        {props.store.rules.map((r, k) => <li key={k}>{r}</li>)}
      </ul>

      <h2>申し込み管理システムについて</h2>

      <p>
        今回のイベントは、<a href="https://nectarition.jp">ねくたりしょん</a>が運用する「Sockbase」を利用しています。<br />
        イベントの内容に関するご質問は、イベント主催である「<a href={props.store._organization.contactUrl}>{props.store._organization.name}</a>」へ直接お問い合わせください。
      </p>

      {import.meta.env.VITE_SOCKBASE_MANAGE_ORGANIZATION_ID === props.store._organization.id
        ? <p>
          申し込み情報はプライバシーポリシーに則って管理いたします。
        </p>
        : <p>
          申し込み情報はねくたりしょんが保管し、イベント主催である「{props.store._organization.name}」に提供いたします。
        </p>}

      <p>
        詳しくは<a href="/privacy-policy" target="_blank">プライバシーポリシー</a>をご確認ください。
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
