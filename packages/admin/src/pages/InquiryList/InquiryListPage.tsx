import { MdInbox } from 'react-icons/md'
import MainLayout from '../../components/Layouts/MainLayout/MainLayout'

const InquiryListPage: React.FC = () => {
  return (
    <MainLayout
      title="問い合わせ管理"
      subTitle="利用者から届いたお問い合わせを管理します。"
      icon={<MdInbox />}
    >
      InquiryListPage
    </MainLayout>
  )
}

export default InquiryListPage
