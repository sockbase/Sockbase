import {
  MdCollectionsBookmark,
  MdHome,
  MdLocalActivity,
  MdMail,
  MdOpenInNew,
  MdPayments,
  MdSettings,
  MdWallet
} from 'react-icons/md'
import styled from 'styled-components'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import AnchorButton from '../../../components/Parts/AnchorButton'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import IconLabel from '../../../components/Parts/IconLabel'
import TopCard from '../../../components/Parts/TopCard'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../layouts/TwoColumnsLayout/TwoColumnsLayout'
import InformationList from '../../IndexPage/InformationList'

const DashboardTopPage: React.FC = () => {
  return (
    <DashboardBaseLayout title="マイページ トップ">
      <Breadcrumbs>
        <li>マイページ</li>
      </Breadcrumbs>

      <PageTitle
        description="Sockbase マイページへようこそ！"
        icon={<MdHome />}
        title="ホーム" />

      <TwoColumnsLayout>
        <>
          <CardContainer>
            <TopCard
              description="あなたに割り当てられているチケットを表示します。"
              icon={<MdLocalActivity />}
              important
              title="マイチケット"
              to="/dashboard/mytickets" />
          </CardContainer>

          <h2>申し込み履歴</h2>
          <CardContainer>
            <TopCard
              description="今までに申し込んだチケット履歴を表示します。"
              icon={<MdWallet />}
              title="購入済みチケット"
              to="/dashboard/tickets" />
            <TopCard
              description="今までに申し込んだサークル参加履歴を表示します。"
              icon={<MdCollectionsBookmark />}
              title="申込済みイベント"
              to="/dashboard/applications" />
            <TopCard
              description="Sockbase を通して申し込んだサークル参加・チケットの決済履歴を表示します。"
              icon={<MdPayments />}
              title="決済履歴"
              to="/dashboard/payments" />
          </CardContainer>

          <h2>設定・サポート</h2>
          <CardContainer>
            <TopCard
              description="Sockbase に登録している情報を変更します。"
              icon={<MdSettings />}
              title="マイページ設定"
              to="/dashboard/settings" />
            <TopCard
              description="Sockbase 運営チームによるサポートが必要な場合は、こちらからお問い合わせください。"
              icon={<MdMail />}
              title="お問い合わせ"
              to="/dashboard/contact" />
          </CardContainer>
        </>
        <>
          <InformationList />
          <h2>法令に基づく表記</h2>
          <FormSection>
            <FormItem $inlined>
              <AnchorButton
                href="/tos"
                target="_blank">
                <IconLabel
                  icon={<MdOpenInNew />}
                  label="利用規約・特商法に基づく表記" />
              </AnchorButton>
              <AnchorButton
                href="/privacy-policy"
                target="_blank">
                <IconLabel
                  icon={<MdOpenInNew />}
                  label="プライバシーポリシー" />
              </AnchorButton>
            </FormItem>
          </FormSection>
        </>
      </TwoColumnsLayout>
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
  grid-template-columns: 1fr;
  gap: 10px;
`
