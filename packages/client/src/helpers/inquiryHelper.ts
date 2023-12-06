const inquiryTypes: Array<{
  type: string
  name: string
  description: string
}> = [
    {
      type: 'payment',
      name: '決済に関する相談',
      description: '決済に紐づいている申し込みIDを添えてお問い合わせください。(申し込みIDは申し込み情報下部にあります)'
    },
    {
      type: 'changePassword',
      name: 'パスワード再設定依頼',
      description: 'ここにはパスワードを記載しないでください。パスワードの再設定は別途ご案内するページにて行います。'
    },
    {
      type: 'removeAccount',
      name: 'アカウント消去依頼',
      description: ''
    },
    {
      type: 'changeCircleInfo',
      name: 'サークル申し込み情報変更, サークルカット変更',
      description: '申し込み情報下部の申し込みIDを添えてお問い合わせください。'
    },
    {
      type: 'other',
      name: 'その他',
      description: ''
    }
  ]

export default {
  inquiryTypes
}
