import { useCallback, useEffect, useMemo, useState } from 'react'
import { MdMail, MdSend } from 'react-icons/md'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import FormButton from '../../components/Form/FormButton'
import FormCheckbox from '../../components/Form/FormCheckbox'
import FormHelp from '../../components/Form/FormHelp'
import FormInput from '../../components/Form/FormInput'
import FormItem from '../../components/Form/FormItem'
import FormLabel from '../../components/Form/FormLabel'
import FormSection from '../../components/Form/FormSection'
import FormTextarea from '../../components/Form/FormTextarea'
import BlinkField from '../../components/Parts/BlinkField'
import Breadcrumbs from '../../components/Parts/Breadcrumbs'
import IconLabel from '../../components/Parts/IconLabel'
import LoadingCircleWrapper from '../../components/Parts/LoadingCircleWrapper'
import PageTitle from '../../components/Parts/PageTitle'
import TwoColumnLayout from '../../components/TwoColumnLayout'
import useEvent from '../../hooks/useEvent'
import useMail from '../../hooks/useMail'
import useValidate from '../../hooks/useValidate'
import DefaultLayout from '../../layouts/DefaultLayout/DefaultLayout'
import type { SockbaseMailSendTarget, SockbaseEventDocument } from 'sockbase'

const EventSendMailPage: React.FC = () => {
  const { eventId } = useParams()
  const { getEventByIdAsync } = useEvent()
  const { sendMailForEventAsync, previewMailBody } = useMail()
  const validator = useValidate()

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
    if (!eventId) return
    getEventByIdAsync(eventId)
      .then(setEvent)
      .catch(err => { throw err })
  }, [eventId])

  const [event, setEvent] = useState<SockbaseEventDocument>()

  return (
    <DefaultLayout
      requireCommonRole={2}
      title="メール送信">
      <Breadcrumbs>
        <li><Link to="/">ホーム</Link></li>
        <li><Link to="/events">イベント一覧</Link></li>
        <li>{event?._organization.name ?? <BlinkField />}</li>
        <li><Link to={`/events/${eventId}`}>{event?.name ?? <BlinkField />}</Link></li>
      </Breadcrumbs>

      <PageTitle
        icon={<MdMail />}
        title="メール送信" />

      <TwoColumnLayout>
        <>
          <FormSection>
            <FormItem>
              <FormLabel>送信対象</FormLabel>
            </FormItem>
            <FormItem $inlined>
              <FormCheckbox
                checked={targetFlag.pending}
                inlined
                label="仮申し込み"
                name="target-all"
                onChange={checked => setTargetFlag(s => ({ ...s, pending: checked }))} />
              <FormCheckbox
                checked={targetFlag.confirmed}
                inlined
                label="申し込み確定"
                name="target-confirmed"
                onChange={checked => setTargetFlag(s => ({ ...s, confirmed: checked }))} />
              <FormCheckbox
                checked={targetFlag.canceled}
                inlined
                label="キャンセル済み"
                name="target-canceled"
                onChange={checked => setTargetFlag(s => ({ ...s, canceled: checked }))} />
            </FormItem>
            <FormItem>
              <FormLabel>返信控え送付先 (CC)</FormLabel>
              <FormInput
                disabled={isProgress}
                onChange={e => setMailCC(e.target.value)}
                value={mailCC} />
            </FormItem>
            <FormItem>
              <FormLabel>返信先 (Reply-To)</FormLabel>
              <FormInput
                disabled={isProgress}
                onChange={e => setMailReplyTo(e.target.value)}
                placeholder="support@sockbase.net"
                value={mailReplyTo} />
              <FormHelp>
                何も入力しない場合、返信先は Sockbase 管理者のメールアドレスになります。
              </FormHelp>
            </FormItem>
            <FormItem>
              <FormLabel>件名</FormLabel>
              <FormInput
                disabled={isProgress}
                onChange={e => setMailSubject(e.target.value)}
                value={mailSubject} />
            </FormItem>
            <FormItem>
              <FormLabel>本文</FormLabel>
              <FormTextarea
                disabled={isProgress}
                onChange={e => setMailBody(e.target.value)}
                style={{ height: '12em' }}
                value={mailBody} />
            </FormItem>
          </FormSection>
        </>
        <>
          <h3>送信プレビュー</h3>

          <h4>[{event?.name}] {mailSubject}</h4>
          <SendPreview>{mailBodyPreview.join('\n')}</SendPreview>
        </>
      </TwoColumnLayout>

      <FormSection>
        <FormItem>
          <LoadingCircleWrapper
            inlined
            isLoading={isProgress}>
            <FormButton
              disabled={errorCount > 0 || isProgress}
              onClick={handleSend}>
              <IconLabel
                icon={<MdSend />}
                label="送信" />
            </FormButton>
          </LoadingCircleWrapper>
        </FormItem>
      </FormSection>
    </DefaultLayout>
  )
}

export default EventSendMailPage

const SendPreview = styled.pre`
  white-space: pre-wrap;
  word-break: break-all;
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 5px;
  background-color: var(--panel-background-color);
`
