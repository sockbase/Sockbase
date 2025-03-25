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
  },
  payment: {
    methods: [
      {
        id: 'online',
        description: 'クレジットカード決済(推奨)'
      },
      {
        id: 'bankTransfer',
        description: '銀行振込'
      }, {
        id: 'voucher',
        description: 'バウチャー'
      }
    ]
  }
} as const

export default constants
