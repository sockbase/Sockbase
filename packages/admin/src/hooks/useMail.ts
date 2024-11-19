import { useCallback } from 'react'
import { httpsCallable } from 'firebase/functions'
import { type SockbaseMailSendTarget, type SockbaseSendMailForEventPayload } from 'sockbase'
import useFirebase from './useFirebase'

interface IUseMail {
  sendMailForEventAsync: (
    eventId: string,
    target: SockbaseMailSendTarget,
    cc: string,
    replyTo: string | null,
    mailSubject: string,
    mailBody: string) => Promise<boolean>
  previewMailBody: (mailBody: string) => string[]
}

const useMail = (): IUseMail => {
  const { getFunctions } = useFirebase()
  const functions = getFunctions()

  const sendMailForEventAsync =
    useCallback(async (
      eventId: string,
      target: SockbaseMailSendTarget,
      cc: string,
      replyTo: string | null,
      mailSubject: string,
      mailBody: string): Promise<boolean> => {
      const sendMailFunction = httpsCallable<SockbaseSendMailForEventPayload, boolean>(
        functions,
        'mail-sendMailManuallyForEvent')
      const sendResult = await sendMailFunction({
        eventId,
        cc,
        replyTo,
        target,
        subject: mailSubject,
        body: mailBody.split('\n')
      })
      return sendResult.data
    }, [])

  const previewMailBody =
    useCallback((mailBody: string): string[] => {
      return [
        '＜サークル名＞',
        '＜申込者名＞ 様',
        '',
        ...mailBody.split('\n'),
        '',
        '-----',
        'このメールは Sockbase を使用し、イベント主催者から送信されました。',
        'お心当たりのない場合、大変恐れ入りますが下記連絡先までその旨ご連絡いただけますと幸いです。',
        '',
        'Sockbase サポート',
        'Mail/ support@sockbase.net',
        'Web/ https://sockbase.net'
      ]
    }, [])

  return {
    sendMailForEventAsync,
    previewMailBody
  }
}

export default useMail
