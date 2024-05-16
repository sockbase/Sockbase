import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdMail, MdSend } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import FormButton from '../../../components/Form/Button'
import FormCheckbox from '../../../components/Form/Checkbox'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormInput from '../../../components/Form/Input'
import FormLabel from '../../../components/Form/Label'
import FormTextarea from '../../../components/Form/Textarea'
import DashboardBaseLayout from '../../../components/Layout/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../components/Layout/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../components/Layout/TwoColumnsLayout/TwoColumnsLayout'
import BlinkField from '../../../components/Parts/BlinkField'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import IconLabel from '../../../components/Parts/IconLabel'
import LoadingCircleWrapper from '../../../components/Parts/LoadingCircleWrapper'
import useEvent from '../../../hooks/useEvent'
import useMail from '../../../hooks/useMail'
import type { SockbaseEventDocument, SockbaseMailSendTarget } from 'sockbase'

const DashboardEventMailSendPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>()
  const { getEventByIdAsync } = useEvent()
  const { previewMailBody } = useMail()

  const [event, setEvent] = useState<SockbaseEventDocument>()

  const [targetFlag, setTargetFlag] = useState<SockbaseMailSendTarget>({
    pending: false,
    confirmed: false,
    canceled: false
  })
  const [mailSubject, setMailSubject] = useState('')
  const [mailBody, setMailBody] = useState('')
  const [isProgress, setProgress] = useState(false)

  const mailBodyPreview = useMemo(() => previewMailBody(mailBody), [mailBody])

  const handleSend = useCallback(() => {
    if (!confirm('メールを送信します\nよろしいですか？')) return
    setProgress(true)
    alert('メールを送信しました')
    setProgress(false)
  }, [])

  useEffect(() => {
    const fetchAsync = async (): Promise<void> => {
      if (!eventId) return
      getEventByIdAsync(eventId)
        .then(fetchedEvent => setEvent(fetchedEvent))
        .catch(err => { throw err })
    }
    fetchAsync()
      .catch(err => { throw err })
  }, [eventId])

  return (
    <DashboardBaseLayout requireCommonRole={2} title="メール送信">
      <Breadcrumbs>
        <li><Link to="/dashboard">マイページ</Link></li>
        <li><Link to="/dashboard/events">管理イベント</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/dashboard/events/${eventId}`}>{event?.eventName ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        title={event?.eventName}
        description="メール送信"
        icon={<MdMail />}
        isLoading={!event} />

      <TwoColumnsLayout>
        <>
          <FormSection>
            <FormItem>
              <FormLabel>送信対象</FormLabel>
            </FormItem>
            <FormItem inlined>
              <FormCheckbox
                name="target-all"
                label="仮申し込み"
                checked={targetFlag.pending}
                onChange={checked => setTargetFlag(s => ({ ...s, pending: checked }))}
                inlined />
              <FormCheckbox
                name="target-confirmed"
                label="申し込み確定"
                checked={targetFlag.confirmed}
                onChange={checked => setTargetFlag(s => ({ ...s, confirmed: checked }))}
                inlined />
              <FormCheckbox
                name="target-canceled"
                label="キャンセル済み"
                checked={targetFlag.canceled}
                onChange={checked => setTargetFlag(s => ({ ...s, canceled: checked }))}
                inlined />
            </FormItem>
            <FormItem>
              <FormLabel>件名</FormLabel>
              <FormInput
                value={mailSubject}
                onChange={e => setMailSubject(e.target.value)} />
            </FormItem>
            <FormItem>
              <FormLabel>本文</FormLabel>
              <FormTextarea
                style={{ height: '12em' }}
                value={mailBody}
                onChange={e => setMailBody(e.target.value)} />
            </FormItem>
          </FormSection>
        </>
        <>
          <h3>送信プレビュー</h3>

          <h4>【{event?.eventName}】{mailSubject}</h4>
          <SendPreview>{mailBodyPreview.join('\n')}</SendPreview>
        </>
      </TwoColumnsLayout>

      <FormSection>
        <FormItem inlined>
          <LoadingCircleWrapper inlined isLoading={isProgress}>
            <FormButton onClick={handleSend} disabled={isProgress} inlined>
              <IconLabel label="送信" icon={<MdSend />} />
            </FormButton>
          </LoadingCircleWrapper>
        </FormItem>
      </FormSection>
    </DashboardBaseLayout>
  )
}

export default DashboardEventMailSendPage

const SendPreview = styled.pre`
  white-space: pre-wrap;
  word-break: break-all;
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 5px;
  background-color: var(--background-dark-color);
`
