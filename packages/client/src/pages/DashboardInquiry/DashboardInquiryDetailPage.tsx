import { Fragment, useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MdMail } from 'react-icons/md'
import {
  type SockbaseInquiryMetaDocument,
  type SockbaseAccount,
  type SockbaseInquiryDocument,
  type SockbaseInquiryStatus
} from 'sockbase'
import useInquiry from '../../hooks/useInquiry'
import useDayjs from '../../hooks/useDayjs'
import PageTitle from '../../components/Layout/DashboardBaseLayout/PageTitle'
import DashboardBaseLayout from '../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import TwoColumnsLayout from '../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import Loading from '../../components/Parts/Loading'
import useUserData from '../../hooks/useUserData'
import BlinkField from '../../components/Parts/BlinkField'
import InquiryStatusLabel from '../../components/Parts/StatusLabel/InquiryStatusLabel'
import FormSection from '../../components/Form/FormSection'
import FormItem from '../../components/Form/FormItem'
import FormButton from '../../components/Form/Button'

const DashboardInquiryListPage: React.FC = () => {
  const { inquiryId } = useParams()
  const {
    getInquiryByIdAsync,
    getInquiryType,
    getInquiryMetaByInquiryIdAsync,
    setStatusByIdAsync
  } = useInquiry()
  const { getUserDataByUserIdAsync } = useUserData()
  const { formatByDate } = useDayjs()

  const [inquiry, setInquiry] = useState<SockbaseInquiryDocument>()
  const [inquiryMeta, setInquiryMeta] = useState<SockbaseInquiryMetaDocument>()
  const [userData, setUserData] = useState<SockbaseAccount>()

  const onInitiliaze: () => void =
    () => {
      const fetchInquiry: () => Promise<void> =
        async () => {
          if (!inquiryId) return

          const fetchedInquiry = await getInquiryByIdAsync(inquiryId)
          setInquiry(fetchedInquiry)

          await getUserDataByUserIdAsync(fetchedInquiry.userId)
          .then((fetchedUserData) => setUserData(fetchedUserData))
          .catch((err) => { throw err })

          const fetchedInquiryMeta = await getInquiryMetaByInquiryIdAsync(inquiryId)
            .then((fetchedMeta) => fetchedMeta)
            .catch(() => {
              const dummyMeta: SockbaseInquiryMetaDocument = {
                status: fetchedInquiry.status,
                createdAt: fetchedInquiry.createdAt,
                updatedAt: fetchedInquiry.updatedAt
              }
              return dummyMeta
            })
          setInquiryMeta(fetchedInquiryMeta)
        }

      fetchInquiry()
        .catch(err => { throw err })
    }
  useEffect(onInitiliaze, [inquiryId])

  const convertMultiLine = useCallback((rawBody: string): React.ReactNode => {
    const body = rawBody.split('\\n')
    return body.map((l, k) => (<Fragment key={k}>
      {l}
      {k + 1 !== body.length && <br />}
    </Fragment>))
  }, [])

  const handleChangeStatus = useCallback((status: SockbaseInquiryStatus): void => {
    if (!inquiryId) return
    if (!confirm('ステータスを変更します\nよろしいですか？')) return
    
    setStatusByIdAsync(inquiryId, status)
      .then(() => {
        setInquiryMeta(s => s && ({
          ...s,
          status
        }))
        alert('ステータスを変更しました')
      })
      .catch(err => {
        alert('ステータスの変更に失敗しました')
        throw err
      })
  }, [])

  return (
    <DashboardBaseLayout title="お問い合わせ一覧">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/inquiries">お問い合わせ一覧</Link></li>
      </Breadcrumbs>
      <PageTitle icon={<MdMail />} title={inquiry && getInquiryType(inquiry?.inquiryType).name} description={`#${inquiryId}`} isLoading={!inquiry}/>
      {!inquiry && inquiryMeta && <Loading text={`問い合わせ情報 #${inquiryId}`} />}
      {inquiry && inquiryMeta && <TwoColumnsLayout>
        <>
          <h3>内容</h3>
          <p>
            {convertMultiLine(inquiry.body)}
          </p>
        </>
        <>
          <h3>情報</h3>
          <table>
            <tbody>
              <tr>
                <th>お問い合わせ番号</th>
                <td>{inquiry.id}</td>
              </tr>
              <tr>
                <th>対応状況</th>
                <td><InquiryStatusLabel status={inquiryMeta.status} /></td>
              </tr>
              <tr>
                <th>ユーザID</th>
                <td>{inquiry.userId}</td>
              </tr>
              <tr>
                <th>ユーザ氏名</th>
                <td>{userData?.name ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>メールアドレス</th>
                <td>{userData?.email ?? <BlinkField />}</td>
              </tr>
              <tr>
                <th>作成日</th>
                <td>{formatByDate(inquiryMeta.createdAt ?? inquiry.createdAt , 'YYYY年M月D日 H時m分')}</td>
              </tr>
              <tr>
                <th>更新日</th>
                <td>{formatByDate(inquiryMeta.updatedAt ?? inquiry.updatedAt , 'YYYY年M月D日 H時m分')}</td>
              </tr>
            </tbody>
          </table>

          <h3>操作</h3>

          <FormSection>
            {inquiryMeta.status !== 0 && <FormItem>
              <FormButton onClick={() => handleChangeStatus(0)} color='default'>オープン</FormButton>
            </FormItem>}
            {inquiryMeta.status !== 1 && <FormItem>
              <FormButton onClick={() => handleChangeStatus(1)}>対応中</FormButton>
            </FormItem>}
            {inquiryMeta.status !== 2 && <FormItem>
              <FormButton onClick={() => handleChangeStatus(2)}>クローズ</FormButton>
            </FormItem>}
          </FormSection>
        </>
      </TwoColumnsLayout>}
    </DashboardBaseLayout>
  )
}

export default DashboardInquiryListPage