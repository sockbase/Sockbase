import * as FirebaseFunctions from 'firebase/functions'
import useFirebase from './useFirebase'
import type { SockbaseMailSendTarget, SockbaseSendMailForEventPayload } from 'sockbase'

interface IUseMail {
  sendMailForEventAsync: (eventId: string, target: SockbaseMailSendTarget, mailSubject: string, mailBody: string) => Promise<boolean>
  previewMailBody: (mailBody: string) => string[]
}
const useMail = (): IUseMail => {
  const { getFunctions } = useFirebase()

  const sendMailForEventAsync = async (eventId: string, target: SockbaseMailSendTarget, mailSubject: string, mailBody: string): Promise<boolean> => {
    const functions = getFunctions()
    const sendMailFunction = FirebaseFunctions
      .httpsCallable<SockbaseSendMailForEventPayload, boolean>(
      functions,
      'mail-sendMailManuallyForEvent')
    const sendResult = await sendMailFunction({
      eventId,
      target,
      subject: mailSubject,
      body: mailBody.split('\n')
    })
    return sendResult.data
  }

  const previewMailBody = (mailBody: string): string[] => {
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
  }
  return {
    sendMailForEventAsync,
    previewMailBody
  }
}

export default useMail
