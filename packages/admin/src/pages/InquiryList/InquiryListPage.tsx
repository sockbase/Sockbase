import { useCallback, useEffect, useState } from 'react'
import {
  type SockbaseInquiryStatus,
  type SockbaseInquiryDocument,
  type SockbaseInquiryMetaDocument,
  type SockbaseAccount
} from 'sockbase'
import useInquiry from '../../hooks/useInquiry'
import useMultiLine from '../../hooks/useMultiLine'
import useDayjs from '../../hooks/useDayjs'
import useModal from '../../hooks/useModal'
import useNotification from '../../hooks/useNotification'
import useUserData from '../../hooks/useUserData'
import ColumnLayout from '../../components/Layouts/ColumnLayout/ColumnLayout'
import ColumnMenuItem from '../../components/Layouts/ColumnLayout/ColumnMenuItem'
import FormSection from '../../components/Form/FormSection'
import FormItem from '../../components/Form/FormItem'
import FormButton from '../../components/Form/FormButton'

const InquiryListPage: React.FC = () => {
  const {
    getInquiries,
    getInquiryMetaByInquiryIdAsync,
    getInquiryType,
    getInquiryStatus,
    setStatusByIdAsync
  } = useInquiry()
  const { getUserDataByUserIdOptionalAsync } = useUserData()
  const { convertMultiLine } = useMultiLine()
  const { formatDateTime } = useDayjs()
  const { showModal, closeModal } = useModal()
  const { addNotification } = useNotification()

  const [inquiries, setInquiries] = useState<SockbaseInquiryDocument[]>()
  const [inquiryMetas, setInquiryMetas] = useState<Record<string, SockbaseInquiryMetaDocument>>()
  const [inquiry, setInquiry] = useState<SockbaseInquiryDocument>()
  const [inquiryMeta, setInquiryMeta] = useState<SockbaseInquiryMetaDocument>()
  const [userDatas, setUserDatas] = useState<Record<string, SockbaseAccount | null>>()

  const onInitialize = (): void => {
    const fetchInquiries = async (): Promise<void> => {
      const fetchedInquiries = await getInquiries()
        .catch(err => { throw err })
      setInquiries(fetchedInquiries)

      Promise.all(
        fetchedInquiries.map(async i => ({ id: i.id, data: await getInquiryMetaByInquiryIdAsync(i.id) }))
      )
        .then(fetchedInquiryMetas => {
          const mappedInquiryMetas = fetchedInquiryMetas
            .reduce<Record<string, SockbaseInquiryMetaDocument>>((p, c) => ({ ...p, [c.id]: c.data }), {})
          setInquiryMetas(mappedInquiryMetas)
        })
        .catch(err => { throw err })

      const userIds = [
        ...fetchedInquiries
          .reduce<Set<string>>((p, c) => p.add(c.userId), new Set<string>())
      ]
      Promise.all(
        userIds.map(async id => ({ id, data: await getUserDataByUserIdOptionalAsync(id) }))
      )
        .then(fetchedUserDatas => {
          const mappedUserDatas = fetchedUserDatas
            .reduce<Record<string, SockbaseAccount | null>>((p, c) => ({ ...p, [c.id]: c.data }), {})
          setUserDatas(mappedUserDatas)
        })
        .catch(err => { throw err })
    }
    fetchInquiries()
      .catch((err) => {
        throw err
      })
  }
  useEffect(onInitialize, [])

  const handleChangeStatus = useCallback((inquiryId: string, status: SockbaseInquiryStatus) => {
    if (!inquiries || !inquiryMetas) return

    closeModal()
    setStatusByIdAsync(inquiryId, status)
      .then(() => {
        setInquiryMeta(s => s && ({ ...s, status }))
        setInquiryMetas(s => s && ({
          ...s,
          ...(s[inquiryId]
            ? ({
              [inquiryId]: {
                ...s[inquiryId],
                status
              }
            })
            : {})
        }))
        addNotification('ステータスの変更に成功しました')
      })
      .catch(err => { throw err })
  }, [inquiries, inquiryMetas])

  const handleConfirmChangeStatus = useCallback((inquiryId: string, status: SockbaseInquiryStatus) => {
    const statusType = getInquiryStatus(status)
    showModal('対応ステータス変更', <>
      対応ステータスを「{statusType}」に変更します。<br />
      よろしいですか？
    </>, [
      <FormSection key="confirmChange">
        <FormItem inlined right>
          <FormButton onClick={() => handleChangeStatus(inquiryId, status)} inlined>変更</FormButton>
          <FormButton onClick={closeModal} inlined>やめる</FormButton>
        </FormItem>
      </FormSection>
    ])
  }, [handleChangeStatus])

  return (
    <ColumnLayout
      title="問い合わせ管理"
      items={
        inquiries === undefined || inquiryMetas === undefined || userDatas === undefined
          ? [<>読み込み中です</>]
          : inquiries
            .sort(
              (a, b) =>
                (inquiryMetas[b.id]?.createdAt?.getTime() || b.createdAt?.getTime() || 9) - (inquiryMetas[a.id]?.createdAt?.getTime() || a.createdAt?.getTime() || 0)
            )
            .map((i) => (
              <ColumnMenuItem
                key={i.id}
                title={getInquiryType(i.inquiryType).name}
                subTitle={`${getInquiryStatus(inquiryMetas[i.id].status ?? i.status)} / ${formatDateTime(inquiryMetas[i.id].createdAt ?? i.createdAt)}`}
                onClick={() => {
                  setInquiry(i)
                  setInquiryMeta(inquiryMetas[i.id])
                }}
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
              <p>{getInquiryStatus(inquiryMeta?.status ?? inquiry.status)}</p>
              <h3>問い合わせユーザID</h3>
              <p>{inquiry.userId}</p>
              <h3>問い合わせユーザ 氏名</h3>
              <p>{userDatas?.[inquiry.userId]?.name ?? '取得失敗'}</p>
              <h3>問い合わせユーザ メールアドレス</h3>
              <p>{userDatas?.[inquiry.userId]?.email ?? '取得失敗'}</p>
              <h3>着信日時</h3>
              <p>{formatDateTime(inquiryMeta?.createdAt ?? inquiry.createdAt)}</p>
              <h3>本文</h3>
              <p>{inquiry && convertMultiLine(inquiry.body)}</p>

              <FormSection>
                {(inquiryMeta?.status ?? inquiry.status) !== 0 && <FormItem>
                  <FormButton onClick={() => handleConfirmChangeStatus(inquiry.id, 0)}>オープン</FormButton>
                </FormItem>}
                {(inquiryMeta?.status ?? inquiry.status) !== 1 && <FormItem>
                  <FormButton onClick={() => handleConfirmChangeStatus(inquiry.id, 1)} color="info">対応中</FormButton>
                </FormItem>}
                {(inquiryMeta?.status ?? inquiry.status) !== 2 && <FormItem>
                  <FormButton onClick={() => handleConfirmChangeStatus(inquiry.id, 2)} color="danger">クローズ</FormButton>
                </FormItem>}
              </FormSection>
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
