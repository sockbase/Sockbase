interface IUseMail {
  previewMailBody: (mailBody: string) => string[]
}
const useMail = (): IUseMail => {
  const previewMailBody = (mailBody: string): string[] => {
    return [
      '＜サークル名＞ ＜申込者名＞ 様',
      '',
      ...mailBody.split('\n'),
      '',
      '-----',
      'このメールは Sockbase を使用し、イベント主催者から送信されました。'
    ]
  }
  return {
    previewMailBody
  }
}

export default useMail
