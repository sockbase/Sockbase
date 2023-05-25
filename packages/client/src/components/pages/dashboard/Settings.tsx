import { MdSettings } from 'react-icons/md'
import PageTitle from '../../Layout/Dashboard/PageTitle'
import TwoColumnsLayout from '../../Layout/TwoColumns/TwoColumns'

const DashboardSettings: React.FC = () => {
  return (
    <>
      <PageTitle
        icon={<MdSettings />}
        title="マイページ設定"
        description="Sockbaseが共通で使用している設定はこのページで変更できます" />

      <TwoColumnsLayout>
        <>
          <h2>ログイン情報</h2>
          <h3>メールアドレス</h3>
          <h3>パスワード</h3>
          <p>
            メールアドレスの変更・パスワードの再設定は現在準備中です。<br />
            再設定を希望される方は「お問い合わせ」よりご連絡ください。
          </p>
          <h2>個人情報</h2>
        </>
        <>
          <h2>お問い合わせ</h2>
          <h3>アカウント削除</h3>
        </>
      </TwoColumnsLayout>
    </>
  )
}

export default DashboardSettings
