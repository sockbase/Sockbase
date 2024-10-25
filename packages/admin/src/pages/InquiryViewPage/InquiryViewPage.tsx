import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { MdCheck, MdCircle, MdMail, MdPendingActions } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import FormButton from '../../components/Form/FormButton'
import FormItem from '../../components/Form/FormItem'
import FormSection from '../../components/Form/FormSection'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import PageTitle from '../../components/Parts/PageTitle'
import InquiryStatusLabel from '../../components/StatusLabel/InquiryStatusLabel'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import useDayjs from '../../hooks/useDayjs'
import useInquiry from '../../hooks/useInquiry'
import useUserData from '../../hooks/useUserData'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseAccount, SockbaseInquiryDocument, SockbaseInquiryMetaDocument, SockbaseInquiryStatus } from 'sockbase'

const InquiryViewPage: React.FC = () => {
  const { inquiryId } = useParams()
  const {
    getInquiryByIdAsync,
    getInquiryMetaByInquiryIdAsync,
    getInquiryType,
    setStatusByIdAsync
  } = useInquiry()
  const { getUserDataByUserIdAsync } = useUserData()
  const { formatByDate } = useDayjs()

  const [inquiry, setInquiry] = useState<SockbaseInquiryDocument>()
  const [inquiryMeta, setInquiryMeta] = useState<SockbaseInquiryMetaDocument>()
  const [userData, setUserData] = useState<SockbaseAccount>()

  const inquiryType = useMemo(() => {
    if (!inquiry) return
    return getInquiryType(inquiry.inquiryType)
  }, [inquiry])

  const convertedMultiLine = useMemo(() => {
    if (!inquiry?.body) return
    const body = inquiry?.body.split('\\n')
    return body.map((l, k) => (
      <Fragment key={k}>
        {l}
        {k + 1 !== body.length && <br />}
      </Fragment>
    ))
  }, [inquiry?.body])

  const handleStatusChange = useCallback((status: SockbaseInquiryStatus) => {
    if (!inquiryId) return
    setStatusByIdAsync(inquiryId, status)
      .then(() => setInquiryMeta(s => s && ({ ...s, status })))
      .catch((err) => { throw err })
  }, [])

  useEffect(() => {
    if (!inquiryId) return
    getInquiryByIdAsync(inquiryId)
      .then(setInquiry)
      .catch((err) => { throw err })
    getInquiryMetaByInquiryIdAsync(inquiryId)
      .then(setInquiryMeta)
      .catch((err) => { throw err })
  }, [])

  useEffect(() => {
    if (!inquiry) return
    getUserDataByUserIdAsync(inquiry.userId)
      .then(setUserData)
      .catch((err) => { throw err })
  }, [inquiry])

  return (
    <DefaultLayout title={inquiryType?.name ?? '問い合わせ照会'} requireSystemRole={2}>
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/inquiries">問い合わせ管理</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdMail />}
        title={`${inquiryType?.name} #${inquiry?.id}`}
        isLoading={!inquiry || !inquiryType} />

      <TwoColumnLayout>
        <>
          <h3>内容</h3>
          <p>
            {convertedMultiLine}
          </p>
        </>
        <>
          <h3>情報</h3>

          <table>
            <tbody>
              <tr>
                <th>問い合わせ番号</th>
                <td>#{inquiry?.id}</td>
              </tr>
              <tr>
                <th>対応状況</th>
                <td><InquiryStatusLabel status={inquiryMeta?.status ?? inquiry?.status} /></td>
              </tr>
              <tr>
                <th>ユーザ ID</th>
                <td>{inquiry?.userId}</td>
              </tr>
              <tr>
                <th>氏名</th>
                <td>{userData?.name}</td>
              </tr>
              <tr>
                <th>メールアドレス</th>
                <td>{userData?.email}</td>
              </tr>
              <tr>
                <th>作成日</th>
                <td>{formatByDate(inquiryMeta?.createdAt ?? inquiry?.createdAt)}</td>
              </tr>
              <tr>
                <th>更新日</th>
                <td>{formatByDate(inquiryMeta?.updatedAt ?? inquiry?.updatedAt)}</td>
              </tr>
            </tbody>
          </table>

          <h3>操作</h3>
          <FormSection>
            <FormItem $inlined>
              {(inquiryMeta?.status ?? inquiry?.status ?? 0) !== 0 && (
                <FormButton onClick={() => handleStatusChange(0)}>
                  <IconLabel icon={<MdCircle />} label='オープン' />
                </FormButton>
              )}
              {(inquiryMeta?.status ?? inquiry?.status ?? 0) !== 1 && (
                <FormButton onClick={() => handleStatusChange(1)}>
                  <IconLabel icon={<MdPendingActions />} label='対応中' />
                </FormButton>
              )}
              {(inquiryMeta?.status ?? inquiry?.status ?? 0) !== 2 && (
                <FormButton onClick={() => handleStatusChange(2)}>
                  <IconLabel icon={<MdCheck />} label='クローズ' />
                </FormButton>
              )}
            </FormItem>
          </FormSection>
        </>
      </TwoColumnLayout>
    </DefaultLayout>
  )
}

export default InquiryViewPage
