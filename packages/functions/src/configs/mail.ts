import dayjs from '../helpers/dayjs'
import { convertTypeText } from '../models/inquiry'
import type {
  SockbaseAccountDocument,
  SockbaseEvent,
  SockbaseEventSpace,
  SockbaseInquiryDocument,
  SockbasePaymentDocument,
  SockbaseStore,
  SockbaseApplicationDocument,
  SockbaseTicketDocument,
  SockbaseStoreDocument,
  SockbaseStoreType
} from 'sockbase'

const commonSuffix = [
  'お心当たりのない場合、大変恐れ入りますが下記連絡先までその旨ご連絡いただけますと幸いです。',
  '',
  'Sockbase サポート',
  'Mail/ support@sockbase.net',
  'Web/ https://sockbase.net'
]

const autoSuffix = [
  '',
  '-----',
  'このメールは Sockbase より自動送信されています。',
  ...commonSuffix
]
const manuallySuffix = [
  '',
  '-----',
  'このメールは Sockbase を使用し、イベント主催者から送信されました。',
  ...commonSuffix
]

const templates = {
  acceptApplication: (event: SockbaseEvent, app: SockbaseApplicationDocument) => ({
    subject: `[${event.name}] サークル参加申し込み 内容確認`,
    body: [
      `この度は、${event.name}への参加申し込みをいただき、誠にありがとうございます。`,
      'お申し込みいただいた内容は以下の通りです。',
      '',
      '[サークル情報]',
      `申し込みID: ${app.hashId}`,
      `サークル名: ${app.circle.name}`,
      `ペンネーム: ${app.circle.penName}`,
      '',
      '[イベント情報]',
      `イベント名: ${event.name}`,
      `会期: ${dayjs(event.schedules.startEvent).tz().format('YYYY年 M月 D日 H時mm分')} 〜 ${dayjs(event.schedules.endEvent).tz().format('H時mm分')}`,
      `会場: ${event.venue.name}`,
      '',
      'お申し込み内容の確認・変更は以下のURLよりご確認いただけます。',
      `https://sockbase.net/dashboard/applications/${app.hashId}`,
      '',
      '[サークルカットご提出のお願い]',
      'お申し込み時にサークルカットをご提出いただいていない場合、',
      'お申し込み内容確認ページの「サークルカットを差し替える」ボタンか、',
      '下記リンクからご提出いただくようお願いいたします。',
      '',
      `https://sockbase.net/dashboard/applications/${app.hashId}/cut`,
      '',
      'お申し込みいただいた内容に誤りがある場合は、お手数ですがご連絡いただきますようお願いいたします。',
      '何かご不明点がありましたら、お気軽にご連絡ください。',
      '今後ともどうぞよろしくお願いいたします。',
      ...autoSuffix
    ]
  }),
  requestCirclePayment: (payment: SockbasePaymentDocument, app: SockbaseApplicationDocument, event: SockbaseEvent, space: SockbaseEventSpace, email: string) => ({
    subject: `[${event.name}] サークル参加費 お支払いのお願い`,
    body: [
      `この度は、${event.name}への参加申し込みをいただき、誠にありがとうございます。`,
      '',
      'サークル参加費のお支払いのご案内をいたします。',
      '',
      '[お支払い情報]',
      `お支払い方法: ${payment.paymentMethod === 1 ? 'オンライン' : '銀行振込'}`,
      `お支払い代金: ${payment.paymentAmount.toLocaleString()}円`,
      `お支払い期限: ${dayjs(event.schedules.endApplication).tz().format('YYYY年 M月 D日')}`,
      `お支払い補助番号: ${payment.bankTransferCode}`,
      '',
      ...payment.paymentMethod === 1
        ? [
          '[オンライン決済]',
          '下記URLからお支払いください。',
          '＜重要＞ フォームに入力されているメールアドレスは変更しないでください。お支払いを確認することができなくなります。',
          `${space.productInfo?.paymentURL}?prefilled_email=${encodeURIComponent(email ?? '')}`,
          ''
        ]
        : [
          '[銀行振込情報]',
          '振込先銀行: GMOあおぞらネット銀行(金融機関コード0310)',
          '加入者名: サイグサトモタダ',
          '預金種目: 普通',
          '支店名: チャイム支店',
          '口座番号: 4598308',
          '',
          `※お振り込みの特定のため、ご依頼人名の先頭に「${payment.bankTransferCode}」と入力してください。`,
          ''
        ],
      '[申し込み情報]',
      `イベント名: ${event.name}`,
      `サークル名: ${app.circle.name}`,
      `ペンネーム: ${app.circle.penName}`,
      `スペース: ${space.name}`,
      `申し込みID: ${app.hashId ?? ''}`,
      '',
      'お申し込みいただいた内容に誤りがある場合は、お手数ですがご連絡いただきますようお願いいたします。',
      'ご不明点がありましたら、お気軽にご連絡ください。',
      '今後ともどうぞよろしくお願いいたします。',
      ...autoSuffix
    ]
  }),
  acceptCirclePayment: (payment: SockbasePaymentDocument, app: SockbaseApplicationDocument, event: SockbaseEvent, space: SockbaseEventSpace) => ({
    subject: '[Sockbase] お支払い完了のお知らせ',
    body: [
      '以下の通り、お支払いを受け付けました。',
      'ご利用ありがとうございました。',
      '',
      '[決済情報]',
      `お支払い方法: ${payment.paymentMethod === 1 ? 'オンライン決済' : '銀行振込'}`,
      `お支払い代金: ${payment.paymentAmount.toLocaleString()}円`,
      '',
      '※プロモーションコード等を使用した場合、実際の決済額と異なって表示される場合がございます。',
      '※オンライン決済の場合、領収書はメールにて別途送付いたします。',
      '',
      '[申し込み情報]',
      `イベント名: ${event.name}`,
      `サークル名: ${app.circle.name}`,
      `ペンネーム: ${app.circle.penName}`,
      `スペース: ${space.name}`,
      `申し込みID: ${app.hashId ?? ''}`,
      ...autoSuffix
    ]
  }),
  updateUnionCircle: (event: SockbaseEvent, app: SockbaseApplicationDocument, unionApp: SockbaseApplicationDocument) => ({
    subject: `[${event.name}] 隣接希望・合体申し込みを受け付けました`,
    body: [
      '以下のサークルが隣接希望・合体申し込みを申請し、システムに登録されましたのでお知らせいたします。',
      '',
      '[申請元サークル情報]',
      `イベント名: ${event.name}`,
      `サークル名: ${app.circle.name}`,
      `ペンネーム: ${app.circle.penName}`,
      `申し込みID: ${app.hashId ?? ''}`,
      '',
      '[申請先サークル情報]',
      `サークル名: ${unionApp.circle.name}`,
      `ペンネーム: ${unionApp.circle.penName}`,
      `申し込みID: ${unionApp.hashId ?? ''}`,
      '',
      '※お心当たりのない方は、マイページのお問い合わせからご連絡ください。',
      ...autoSuffix
    ]
  }),
  acceptTicket: (store: SockbaseStoreDocument, type: SockbaseStoreType, ticket: SockbaseTicketDocument) => ({
    subject: `[${store.name}] チケット申し込み 内容確認`,
    body: [
      `この度は、${store.name}への参加申し込みをいただき、誠にありがとうございます。お申し込みいただいた内容を確認いたしました。`,
      'お申し込みいただいた内容は以下の通りです。',
      '',
      '[チケット情報]',
      `チケットストア名: ${store.name}`,
      `会期: ${dayjs(store.schedules.startEvent).tz().format('YYYY年 M月 D日 H時mm分')} 〜 ${dayjs(store.schedules.endEvent).tz().format('H時mm分')}`,
      ...(store.venue ? [`会場: ${store.venue.name}`] : []),
      `チケット種別: ${type.name}`,
      '',
      '購入したチケットは以下のURLからご確認いただけます。',
      `https://sockbase.net/dashboard/tickets/${ticket.hashId}`,
      '',
      'お申し込みいただいた内容に誤りがある場合は、お手数ですがご連絡いただきますようお願いいたします。',
      '何かご不明点がありましたら、お気軽にご連絡ください。',
      '今後ともどうぞよろしくお願いいたします。',
      ...autoSuffix
    ]
  }),
  requestTicketPayment: (payment: SockbasePaymentDocument, ticket: SockbaseTicketDocument, store: SockbaseStore, type: SockbaseStoreType, email: string) => ({
    subject: `[${store.name}] お支払いのお願い`,
    body: [
      `この度は、${store.name}への参加申し込みをいただき、誠にありがとうございます。`,
      '',
      '参加費のお支払いのご案内をいたします。',
      '',
      '[お支払い情報]',
      `お支払い方法: ${payment.paymentMethod === 1 ? 'オンライン' : '銀行振込'}`,
      `お支払い代金: ${payment.paymentAmount.toLocaleString()}円`,
      `お支払い期限: ${dayjs(store.schedules.endApplication).tz().format('YYYY年 M月 D日')}`,
      `お支払い補助番号: ${payment.bankTransferCode}`,
      '',
      ...payment.paymentMethod === 1
        ? [
          '[オンライン決済]',
          '下記URLからお支払いください。',
          '＜重要＞ フォームに入力されているメールアドレスは変更しないでください。お支払いを確認することができなくなります。',
          `${type.productInfo?.paymentURL}?prefilled_email=${encodeURIComponent(email ?? '')}`,
          ''
        ]
        : [
          '[銀行振込情報]',
          '振込先銀行: GMOあおぞらネット銀行(金融機関コード0310)',
          '加入者名: サイグサトモタダ',
          '預金種目: 普通',
          '支店名: チャイム支店',
          '口座番号: 4598308',
          '',
          `※お振り込みの特定のため、ご依頼人名の先頭に「${payment.bankTransferCode}」と入力してください。`,
          ''
        ],
      '[申し込み情報]',
      `イベント名: ${store.name}`,
      `チケット種別: ${type.name}`,
      `チケットID: ${ticket.hashId}`,
      '',
      'お申し込みいただいた内容に誤りがある場合は、お手数ですがご連絡いただきますようお願いいたします。',
      'ご不明点がありましたら、お気軽にご連絡ください。',
      '今後ともどうぞよろしくお願いいたします。',
      ...autoSuffix
    ]
  }),
  acceptTicketPayment: (payment: SockbasePaymentDocument, store: SockbaseStoreDocument, type: SockbaseStoreType, ticket: SockbaseTicketDocument) => ({
    subject: `[${store.name}] お支払い完了のお知らせ`,
    body: [
      '以下の通り、お支払いを受け付けました。',
      'ご利用ありがとうございました。',
      '',
      '[決済情報]',
      `お支払い方法: ${payment.paymentMethod === 1 ? 'オンライン決済' : '銀行振込'}`,
      `お支払い代金: ${payment.paymentAmount.toLocaleString()}円`,
      '',
      '※プロモーションコード等を使用した場合、実際の決済額と異なって表示される場合がございます。',
      '※オンライン決済の場合、領収書はメールにて別途送付いたします。',
      '',
      '[申し込み情報]',
      `チケットストア名: ${store.name}`,
      `チケット種別: ${type.name}`,
      `チケットID: ${ticket.hashId}`,
      ...autoSuffix
    ]
  }),
  acceptInquiry: (inquiry: SockbaseInquiryDocument, user: SockbaseAccountDocument) => ({
    subject: '[Sockbase] お問い合わせを受け付けました',
    body: [
      `${user.name} 様`,
      '以下のとおり、お問い合せを受け付けました。',
      '返信は通常3営業日以内に行いますので、今しばらくお待ちください。',
      '',
      '[お問い合わせ内容]',
      `ご返信先: ${user.email}`,
      `お問い合わせ種類: ${convertTypeText(inquiry.inquiryType)}`,
      'お問い合わせ内容',
      inquiry.body.replace('\\n', '\n'),
      ...autoSuffix
    ]
  }),
  sendManuallyForEvent: (subject: string, body: string[], event: SockbaseEvent, app: SockbaseApplicationDocument, user: SockbaseAccountDocument) => ({
    subject: `[${event.name}] ${subject}`,
    body: [
      app.circle.name,
      `${user.name} 様`,
      '',
      ...body,
      ...manuallySuffix
    ]
  })
}

export default {
  templates
}
