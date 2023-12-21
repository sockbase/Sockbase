import { useEffect, useState } from 'react'
import useInquiry from '../../hooks/useInquiry'
import ColumnLayout from '../../components/Layouts/ColumnLayout/ColumnLayout'
import ColumnMenuItem from '../../components/Layouts/ColumnLayout/ColumnMenuItem'
import { type SockbaseInquiryDocument } from 'sockbase'
import useMultiLine from '../../hooks/useMultiLine'
import useDayjs from '../../hooks/useDayjs'

const InquiryListPage: React.FC = () => {
  const { getInquiries, getInquiryType, getInquiryStatus } = useInquiry()
  const { convertMultiLine } = useMultiLine()
  const { formatDateTime } = useDayjs()

  const [inquiries, setInquiries] = useState<SockbaseInquiryDocument[]>()
  const [inquiry, setInquiry] = useState<SockbaseInquiryDocument>()

  const onInitialize = (): void => {
    const fetchInquiries = async (): Promise<void> => {
      getInquiries()
        .then((fetchedInquiries) => setInquiries(fetchedInquiries))
        .catch(err => { throw err })
    }
    fetchInquiries()
      .catch((err) => {
        throw err
      })
  }
  useEffect(onInitialize, [])

  return (
    <ColumnLayout
      title="問い合わせ管理"
      items={
        inquiries === undefined
          ? [<>読み込み中です</>]
          : inquiries
            .sort(
              (a, b) =>
                (b.createdAt?.getTime() || 9) - (a.createdAt?.getTime() || 0)
            )
            .map((i) => (
              <ColumnMenuItem
                key={i.id}
                title={getInquiryType(i.inquiryType).name}
                subTitle={i.id}
                onClick={() => setInquiry(i)}
              />
            ))
      }
      main={
        inquiry
          ? (
            <>
              <h3>問い合わせ番号</h3>
              <p>{inquiry.id}</p>
              <h3>対応状況</h3>
              <p>{getInquiryStatus(inquiry.status)}</p>
              <h3>問い合わせユーザ</h3>
              <p>{inquiry.userId}</p>
              <h3>着信日時</h3>
              <p>{formatDateTime(inquiry.createdAt)}</p>
              <h3>本文</h3>
              <p>{inquiry && convertMultiLine(inquiry.body)}</p>
            </>
          )
          : (
            <></>
          )
      }
    />
  )
}

export default InquiryListPage
