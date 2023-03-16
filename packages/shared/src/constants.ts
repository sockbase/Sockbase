const constants = {
  hello: 'helloworld',
  application: {
    statusText: ['仮申し込み', 'キャンセル済み', '申し込み確定']
  },
  organization: {
    systemOrganizationId: 'system'
  },
  user: {
    roleText: ['ユーザ', 'スタッフ', '管理者']
  }
} as const

export default constants
