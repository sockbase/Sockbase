import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MdInbox } from 'react-icons/md'
import { type SockbaseInquiryDocument, type SockbaseInquiryMetaDocument } from 'sockbase'
import useInquiry from '../../hooks/useInquiry'
import useDayjs from '../../hooks/useDayjs'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import InquiryStatusLabel from '../../components/Parts/StatusLabel/InquiryStatusLabel'
import FormSection from '../../components/Form/FormSection'
import FormItem from '../../components/Form/FormItem'
import FormCheckbox from '../../components/Form/Checkbox'

const DashboardInquiryListPage: React.FC = () => {
  const { getInquiries, getInquiryType, getInquiryMetaByInquiryIdAsync } = useInquiry()
  const { formatByDate } = useDayjs()

  const [inquiries, setInquiries] = useState<SockbaseInquiryDocument[]>()
  const [inquiryMetas, setInquiryMetas] = useState<Record<string, SockbaseInquiryMetaDocument | null>>()

  const [showClosedInquiries, setShowClosedInquiries] = useState(false)

  const filteredInquiries = useMemo(() => {
    if (!inquiries || !inquiryMetas) return undefined
    return inquiries
      .sort((a, b) => ((inquiryMetas[b.id]?.createdAt ?? b.createdAt)?.getTime() ?? 9) - ((inquiryMetas[a.id]?.createdAt ?? a.createdAt)?.getTime() ?? 0))
      .filter(i => showClosedInquiries || (inquiryMetas[i.id]?.status ?? i.status) !== 2)
  }, [inquiries, inquiryMetas, showClosedInquiries])

  const onInitiliaze: () => void =
    () => {
      const fetchInquiries: () => Promise<void> =
        async () => {
          const fetchedInquiries = await getInquiries()
          setInquiries(fetchedInquiries)

          await Promise.all(fetchedInquiries
            .map(async i => ({
              id: i.id,
              data: await getInquiryMetaByInquiryIdAsync(i.id)
                      .then((fetchedMeta) => fetchedMeta)
                      .catch(() => null)
            })))
            .then((fetchedMetas) => {
              const mappedMetas = fetchedMetas.reduce<Record<string, SockbaseInquiryMetaDocument | null>>((p, c) => ({
                ...p,
                [c.id]: c.data
              }), {})
              setInquiryMetas(mappedMetas)
            })
            .catch((err) => { throw err })
        }

      fetchInquiries()
        .catch(err => { throw err })
    }
  useEffect(onInitiliaze, [])

  return (
    <DashboardBaseLayout title="お問い合わせ一覧">
      <PageTitle icon={<MdInbox />} title='お問い合わせ一覧' description='お問い合わせ情報を表示中' />

      <FormSection>
        <FormItem>
          <FormCheckbox
            name='showClosedInquiries'
            label='クローズしたお問い合わせを表示'
            checked={showClosedInquiries}
            onChange={checked => setShowClosedInquiries(checked)}/>
        </FormItem>
      </FormSection>

      <table>
        <thead>
          <tr>
            <th>状態</th>
            <th>種別</th>
            <th>お問い合わせ番号</th>
            <th>更新日</th>
          </tr>
        </thead>
        <tbody>
          {inquiryMetas && filteredInquiries
            ?.map(i =>
              <tr key={i.id}>
                <td><InquiryStatusLabel status={inquiryMetas[i.id]?.status ?? i.status} /></td>
                <td>{getInquiryType(i.inquiryType).name}</td>
                <td><Link to={`/dashboard/inquiries/${i.id}`}>{i.id}</Link></td>
                <td>{formatByDate(inquiryMetas[i.id]?.updatedAt ?? i.updatedAt, 'YYYY年M月D日 H時m分')}</td>
              </tr>)}
              {filteredInquiries?.length === 0 && <tr>
                <td>検索条件に一致するお問い合わせが見つかりませんでした</td>
              </tr>}
        </tbody>
      </table>
    </DashboardBaseLayout>
  )
}

export default DashboardInquiryListPage