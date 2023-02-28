import Breadcrumbs from '../../Parts/Breadcrumbs'
import PageTitle from '../../Layout/Dashboard/PageTitle'
import Alert from '../../Parts/Alert'

const DashboardTemplate: React.FC = (props) => {
  return (
    <>
      <Breadcrumbs>
        <li>ダッシュボード</li>
        <li>第二回しおばな祭</li>
      </Breadcrumbs>
      <PageTitle
        title="ねくたりしょん / Nectarition"
        description="サークル申込み情報照会" />

      <Alert type="danger" title="決済が完了していません！">
        サークル参加費のお支払いが確認できておりません。<br />
        銀行振込でのお支払いの場合、運営の確認が完了するまでお時間がかかる場合がございます。
      </Alert>
      <Alert title="頒布物情報の事前入力へのご協力をお願いいたします。">
        サークル参加登録受付を円滑に進めるため、頒布物情報の事前入力(頒布物情報デジタル提出)へのご協力をお願いいたします。
      </Alert>

      <p>ここに何らかのダッシュボードコンテンツが入ります</p>
    </>
  )
}

export default DashboardTemplate
