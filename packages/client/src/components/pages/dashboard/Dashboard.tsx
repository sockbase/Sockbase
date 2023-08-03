import styled from 'styled-components'
import { MdEditNote, MdHome, MdLocalActivity, MdMail, MdPayments, MdSettings, MdWallet } from 'react-icons/md'
import PageTitle from '../../Layout/Dashboard/PageTitle'
import TopCard from '../../Parts/TopCard'

const Dashboard: React.FC = () => {
  return (
    <>
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
    </>
  )
}

export default Dashboard

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
