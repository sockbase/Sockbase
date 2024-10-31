import { useEffect, useMemo, useState } from 'react'
import { MdInbox } from 'react-icons/md'
import { Link } from 'react-router-dom'
import FormCheckbox from '../../components/Form/FormCheckbox'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import PageTitle from '../../components/Parts/PageTitle'
import InquiryStatusLabel from '../../components/StatusLabel/InquiryStatusLabel'
import useDayjs from '../../hooks/useDayjs'
import useInquiry from '../../hooks/useInquiry'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseInquiryDocument, SockbaseInquiryMetaDocument } from 'sockbase'

const InquiryListPage: React.FC = () => {
  const { getInquiries, getInquiryMetaByInquiryIdAsync, getInquiryType } = useInquiry()
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

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
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
    fetchAsync()
      .catch(err => { throw err })
  }, [])

  return (
    <DefaultLayout title='問い合わせ管理' requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdInbox />}
        title="問い合わせ管理" />

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
            <th>問い合わせ番号</th>
            <th>更新日</th>
          </tr>
        </thead>
        <tbody>
          {filteredInquiries?.map((i) => (
            <tr key={i.id}>
              <td><InquiryStatusLabel status={inquiryMetas?.[i.id]?.status ?? i.status} isOnlyIcon={true} /></td>
              <td>{getInquiryType(i.inquiryType).name}</td>
              <td><Link to={`/inquiries/${i.id}`}>{i.id}</Link></td>
              <td>{formatByDate(inquiryMetas?.[i.id]?.createdAt, 'YYYY/M/D H:mm')}</td>
            </tr>
          ))}
          {filteredInquiries?.length === 0 && (
            <tr>
              <td colSpan={4}>検索条件に一致するお問い合わせが見つかりませんでした</td>
            </tr>
          )}
        </tbody>
      </table>
    </DefaultLayout>
  )
}

export default InquiryListPage
