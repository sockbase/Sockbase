import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdMail, MdSend } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import FormButton from '../../../components/Form/Button'
import FormCheckbox from '../../../components/Form/Checkbox'
import FormItem from '../../../components/Form/FormItem'
import FormSection from '../../../components/Form/FormSection'
import FormHelp from '../../../components/Form/Help'
import FormInput from '../../../components/Form/Input'
import FormLabel from '../../../components/Form/Label'
import FormTextarea from '../../../components/Form/Textarea'
import BlinkField from '../../../components/Parts/BlinkField'
import Breadcrumbs from '../../../components/Parts/Breadcrumbs'
import IconLabel from '../../../components/Parts/IconLabel'
import LoadingCircleWrapper from '../../../components/Parts/LoadingCircleWrapper'
import useEvent from '../../../hooks/useEvent'
import useMail from '../../../hooks/useMail'
import useValidate from '../../../hooks/useValidate'
import DashboardBaseLayout from '../../../layouts/DashboardBaseLayout/DashboardBaseLayout'
import PageTitle from '../../../layouts/DashboardBaseLayout/PageTitle'
import TwoColumnsLayout from '../../../layouts/TwoColumnsLayout/TwoColumnsLayout'
import type { SockbaseEventDocument, SockbaseMailSendTarget } from 'sockbase'

const DashboardEventMailSendPage: React.FC = () => {
  const validator = useValidate()

  const { eventId } = useParams<{ eventId: string }>()
  const { getEventByIdAsync } = useEvent()
  const {
    sendMailForEventAsync,
    previewMailBody
  } = useMail()

  const [event, setEvent] = useState<SockbaseEventDocument>()

  const [targetFlag, setTargetFlag] = useState<SockbaseMailSendTarget>({
    pending: false,
    confirmed: false,
    canceled: false
  })
  const [mailCC, setMailCC] = useState('')
  const [mailReplyTo, setMailReplyTo] = useState('')
  const [mailSubject, setMailSubject] = useState('')
  const [mailBody, setMailBody] = useState('')
  const [isProgress, setProgress] = useState(false)

  const mailBodyPreview = useMemo(() => previewMailBody(mailBody), [mailBody])

  const errorCount = useMemo(() => {
    const validators = [
      validator.isNotEmpty(mailSubject),
      validator.isNotEmpty(mailBody),
      validator.isEmpty(mailCC) || validator.isEmail(mailCC),
      validator.isEmpty(mailReplyTo) || validator.isEmail(mailReplyTo)
    ]
    return validators.filter(v => !v).length
  }, [mailSubject, mailBody, mailCC, mailReplyTo])

  const handleSend = useCallback(() => {
    if (!eventId || errorCount > 0) return
    if (!confirm('メールを送信します\nよろしいですか？')) return
    setProgress(true)
    sendMailForEventAsync(eventId, targetFlag, mailCC, mailReplyTo || null, mailSubject, mailBody)
      .then(result => {
        if (!result) {
          alert('メール送信に失敗しました')
          return
        }
        alert('メール送信に成功しました')
      })
      .catch(err => {
        alert('エラーが発生しました')
        throw err
      })
      .finally(() => setProgress(false))
  }, [eventId, errorCount, targetFlag, mailSubject, mailBody, mailCC, mailReplyTo])

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
        <li>管理イベント</li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/dashboard/events/${eventId}`}>{event?.name ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        title={event?.name}
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
              <FormLabel>返信控え送付先 (CC)</FormLabel>
              <FormInput
                value={mailCC}
                onChange={e => setMailCC(e.target.value)}
                disabled={isProgress} />
            </FormItem>
            <FormItem>
              <FormLabel>返信先 (Reply-To)</FormLabel>
              <FormInput
                value={mailReplyTo}
                onChange={e => setMailReplyTo(e.target.value)}
                placeholder="support@sockbase.net"
                disabled={isProgress} />
              <FormHelp>
                何も入力しない場合、返信先は Sockbase 管理者のメールアドレスになります。
              </FormHelp>
            </FormItem>
            <FormItem>
              <FormLabel>件名</FormLabel>
              <FormInput
                value={mailSubject}
                onChange={e => setMailSubject(e.target.value)}
                disabled={isProgress} />
            </FormItem>
            <FormItem>
              <FormLabel>本文</FormLabel>
              <FormTextarea
                style={{ height: '12em' }}
                value={mailBody}
                onChange={e => setMailBody(e.target.value)}
                disabled={isProgress} />
            </FormItem>
          </FormSection>
        </>
        <>
          <h3>送信プレビュー</h3>

          <h4>[{event?.name}] {mailSubject}</h4>
          <SendPreview>{mailBodyPreview.join('\n')}</SendPreview>
        </>
      </TwoColumnsLayout>

      <FormSection>
        <FormItem>
          <LoadingCircleWrapper inlined isLoading={isProgress}>
            <FormButton onClick={handleSend} disabled={errorCount > 0 || isProgress} inlined>
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
