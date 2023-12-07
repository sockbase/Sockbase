import styled from 'styled-components'
import {
  MdEditCalendar,
  MdEditNote,
  MdHome,
  MdInbox,
  MdLocalActivity,
  MdMail,
  MdPayments,
  MdQrCodeScanner,
  MdSettings,
  MdStore,
  MdWallet
} from 'react-icons/md'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import TopCard from '../../components/Parts/TopCard'
import useRole from '../../hooks/useRole'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'

const DashboardTopPage: React.FC = () => {
  const { commonRole } = useRole()

  return (
    <DashboardBaseLayout title="マイページ トップ" requireSystemRole={0}>
      <PageTitle
        icon={<MdHome />}
        title="ホーム"
        description="Sockbaseマイページへようこそ！" />

      <CardContainer>
        <TopCard
          to="/dashboard/mytickets"
          icon={<MdLocalActivity />}
          title="マイチケット"
          description="あなたに割り当てられているチケットを表示します。"
          important />
      </CardContainer>

      <h2>申し込み履歴</h2>
      <CardContainer>
        <TopCard
          to="/dashboard/tickets"
          icon={<MdWallet />}
          title="チケット申し込み履歴"
          description="今までに申し込んだチケット履歴を表示します。" />
        <TopCard
          to="/dashboard/applications"
          icon={<MdEditNote />}
          title="サークル申し込み履歴"
          description="今までに申し込んだサークル参加履歴を表示します。" />
        <TopCard
          to="/dashboard/payments"
          icon={<MdPayments />}
          title="決済履歴"
          description="Sockbaseを通して申し込んだサークル参加・チケットの決済履歴を表示します。" />
      </CardContainer>

      <h2>サポート・設定</h2>
      <CardContainer>
        <TopCard
          to="/dashboard/contact"
          icon={<MdMail />}
          title="お問い合わせ"
          description="Sockbase運営チームによるサポートが必要な場合は、こちらからお問い合わせください。" />
        <TopCard
          to="/dashboard/settings"
          icon={<MdSettings />}
          title="マイページ設定"
          description="Sockbaseに登録している情報を変更します。" />
      </CardContainer>

      {!!commonRole && commonRole >= 1 && <>
        <h2>イベント開催支援</h2>
        <CardContainer>
          <TopCard
            to="/dashboard/tickets/terminal"
            icon={<MdQrCodeScanner />}
            title="チケット照会ターミナル"
            description="チケットコードを用いて情報を表示し、使用ステータスを管理します。" />
        </CardContainer>
      </>}

      {!!commonRole && commonRole >= 2 && <>
        <h2>システム操作</h2>
        <CardContainer>
          <TopCard
            to="/dashboard/events/"
            icon={<MdEditCalendar />}
            title="管理イベント"
            description="Sockbaseで管理しているイベントを表示します。" />
          <TopCard
            to="/dashboard/stores"
            icon={<MdStore />}
            title="チケットストア管理"
            description="Sockbaseで管理しているチケットストアを表示します。" />
          <TopCard
            to="/dashboard/inquiries"
            icon={<MdInbox />}
            title="問い合わせ管理"
            description="利用者から届いたお問い合わせを管理します。" />
        </CardContainer>
      </>}
    </DashboardBaseLayout>
  )
}

export default DashboardTopPage

const CardContainer = styled.section`
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }

  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;

  @media screen and (max-width: 840px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`
