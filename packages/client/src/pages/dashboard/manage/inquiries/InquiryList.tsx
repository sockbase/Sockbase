import { useEffect, useState } from 'react'
import type { SockbaseInquiryDocument } from 'sockbase'

import { MdInbox } from 'react-icons/md'

import useInquiry from '../../../../hooks/useInquiry'
import useDayjs from '../../../../hooks/useDayjs'

import PageTitle from '../../../../components/Layout/Dashboard/PageTitle'
import DashboardLayout from '../../../../components/Layout/Dashboard/Dashboard'

const InquiryList: React.FC = () => {
  const { getInquiries } = useInquiry()
  const { formatByDate } = useDayjs()

  const [inquiries, setInquiries] = useState<SockbaseInquiryDocument[]>()

  const onInitiliaze: () => void =
    () => {
      const fetchInquiries: () => Promise<void> =
        async () => {
          const fetchedInquiries = await getInquiries()
          setInquiries(fetchedInquiries)
          console.log(fetchedInquiries)
        }

      fetchInquiries()
        .catch(err => { throw err })
    }
  useEffect(onInitiliaze, [])

  return (
    <DashboardLayout title="お問い合わせ一覧">
      <PageTitle icon={<MdInbox />} title='お問い合わせ一覧' description='オープン中のお問い合わせ情報を表示中' />

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>送信者</th>
            <th>種別</th>
            <th>内容</th>
            <th>状態</th>
            <th>更新日</th>
          </tr>
        </thead>
        <tbody>
          {inquiries
            ?.sort((a, b) => (b.createdAt?.getTime() ?? 9) - (a.createdAt?.getTime() ?? 0))
            .map(i =>
              <tr key={i.id}>
                <td>{i.id}</td>
                <td>{i.userId}</td>
                <td>{i.inquiryType}</td>
                <td>{i.body}</td>
                <td>{i.status}</td>
                <td>{formatByDate(i.updatedAt, 'YYYY年M月D日 H時m分')}</td>
              </tr>)}
        </tbody>
      </table>
    </DashboardLayout>
  )
}

export default InquiryList
