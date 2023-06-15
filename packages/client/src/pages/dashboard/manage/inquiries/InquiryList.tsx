import { MdInbox } from 'react-icons/md'

import PageTitle from '../../../../components/Layout/Dashboard/PageTitle'
import DashboardLayout from '../../../../components/Layout/Dashboard/Dashboard'

const InquiryList: React.FC = () => {
  return (
    <DashboardLayout title="">
      <PageTitle icon={<MdInbox />} title='お問い合わせ一覧' description='オープン中のお問い合わせ情報を表示中' />
    </DashboardLayout>
  )
}

export default InquiryList
