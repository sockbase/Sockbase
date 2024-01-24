import dayjs from '../helpers/dayjs'
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
  SockbaseStoreType,
  SockbaseEventGenre
} from 'sockbase'
import { convertTypeText } from '../models/inquiry'

const suffix = [
  '',
  '-----',
  'このメールはシステムによって自動送信されています。',
  'このメールに覚えのない場合は、このメールに返信していただきますようお願いいたします。',
  '',
  'Sockbase'
]

const templates = {
  acceptApplication: (event: SockbaseEvent, app: SockbaseApplicationDocument, space: SockbaseEventSpace, genre: SockbaseEventGenre) => ({
    subject: `[${event.eventName}] サークル参加申し込み 内容確認`,
    body: [
      `この度は、${event.eventName}への参加申し込みをいただき、誠にありがとうございます。お申し込みいただいた内容を確認いたしました。`,
      'お申し込みいただいた内容は以下の通りです。',
      '',
      '[サークル情報]',
      `サークル名: ${app.circle.name}`,
      `サークル名(よみ): ${app.circle.yomi}`,
      `ペンネーム: ${app.circle.penName}`,
      `ペンネーム(よみ): ${app.circle.penNameYomi}`,
      `スペース数: ${space.name}`,
      `成人向け頒布物の有無: ${app.circle.hasAdult ? '有り' : '無し'}`,
      `頒布物のジャンル: ${genre.name}`,
      `頒布物概要: ${app.overview.description}`,
      `総搬入量: ${app.overview.totalAmount}`,
      `合体希望サークル 合体申し込みID: ${app.unionCircleId}`,
      `プチオンリーコード: ${app.petitCode}`,
      `通信欄: ${app.remarks}`,
      '',
      '[イベント情報]',
      `イベント名: ${event.eventName}`,
      `日程: ${dayjs(event.schedules.startEvent).tz().format('YYYY年M月D日 H:mm')} 〜 ${dayjs(event.schedules.endEvent).tz().format('H:mm')}`,
      // '場所: ', // TODO: 場所 あとで追記
      '',
      'お申し込みいただいた内容に誤りがある場合は、お手数ですがご連絡いただきますようお願いいたします。',
      '何かご不明点がありましたら、お気軽にご連絡ください。',
      '今後ともどうぞよろしくお願いいたします。',
      ...suffix
    ]
  }),
  requestCirclePayment: (payment: SockbasePaymentDocument, app: SockbaseApplicationDocument, event: SockbaseEvent, space: SockbaseEventSpace, email: string) => ({
    subject: `[${event.eventName}] サークル参加費 お支払いのお願い`,
    body: [
      `この度は、${event.eventName}への参加申し込みをいただき、誠にありがとうございます。`,
      '',
      'サークル参加費のお支払いのご案内をいたします。',
      '',
      '[お支払い情報]',
      `お支払い方法: ${payment.paymentMethod === 1 ? 'オンライン' : '銀行振込'}`,
      `お支払い代金: ${payment.paymentAmount.toLocaleString()}円`,
      `お支払い期限: ${dayjs(event.schedules.endApplication).tz().format('YYYY年M月D日')}`,
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
          '[銀行振込情報/ ゆうちょ銀行からのお振り込み]',
          '加入者名: ノートセンディング',
          '口座記号・口座番号: 10740-30814531',
          '',
          '[銀行振込情報/ 他の金融機関からのお振り込み]',
          '振込先銀行: ゆうちょ銀行(金融機関コード9900)',
          '加入者名: ノートセンディング',
          '預金種目: 普通',
          '支店番号・支店名: 078(◯七八)',
          '口座番号: 3081453',
          '',
          `※お振り込みの特定のため、ご依頼人名の先頭に「${payment.bankTransferCode}」と入力してください。`,
          ''
        ],
      '[申し込み情報]',
      `イベント名: ${event.eventName}`,
      `サークル名: ${app.circle.name}`,
      `ペンネーム: ${app.circle.penName}`,
      `スペース: ${space.name}`,
      `申込みID: ${app.hashId ?? ''}`,
      '',
      'お申し込みいただいた内容に誤りがある場合は、お手数ですがご連絡いただきますようお願いいたします。',
      'ご不明点がありましたら、お気軽にご連絡ください。',
      '今後ともどうぞよろしくお願いいたします。',
      ...suffix
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
      `イベント名: ${event.eventName}`,
      `サークル名: ${app.circle.name}`,
      `ペンネーム: ${app.circle.penName}`,
      `スペース: ${space.name}`,
      `申込みID: ${app.hashId ?? ''}`,
      ...suffix
    ]
  }),
  updateUnionCircle: (event: SockbaseEvent, app: SockbaseApplicationDocument, unionApp: SockbaseApplicationDocument) => ({
    subject: `[${event.eventName}] 隣接希望・合体申し込みを受け付けました`,
    body: [
      '以下のサークルが隣接希望・合体申し込みを申請し、システムに登録されましたのでお知らせいたします。',
      '',
      '[申請元サークル情報]',
      `イベント名: ${event.eventName}`,
      `サークル名: ${app.circle.name}`,
      `ペンネーム: ${app.circle.penName}`,
      `申し込みID: ${app.hashId ?? ''}`,
      '',
      '[申請先サークル情報]',
      `サークル名: ${unionApp.circle.name}`,
      `ペンネーム: ${unionApp.circle.penName}`,
      `申し込みID: ${unionApp.hashId ?? ''}`,
      '',
      '※お心当たりのない方は、マイペースのお問い合わせからご連絡ください。',
      ...suffix
    ]
  }),
  acceptTicket: (store: SockbaseStoreDocument, type: SockbaseStoreType, ticket: SockbaseTicketDocument) => ({
    subject: `[${store.storeName}] チケット申し込み 内容確認`,
    body: [
      `この度は、${store.storeName}への参加申し込みをいただき、誠にありがとうございます。お申し込みいただいた内容を確認いたしました。`,
      'お申し込みいただいた内容は以下の通りです。',
      '',
      '[チケット情報]',
      `チケットストア名: ${store.storeName}`,
      `イベント日程: ${dayjs(store.schedules.startEvent).tz().format('YYYY年M月D日 H:mm')} 〜 ${dayjs(store.schedules.endEvent).tz().format('H:mm')}`,
      `チケット種別: ${type.name}`,
      // '場所: ', // TODO: 場所 あとで追記
      '',
      'お申し込みいただいた内容に誤りがある場合は、お手数ですがご連絡いただきますようお願いいたします。',
      '何かご不明点がありましたら、お気軽にご連絡ください。',
      '今後ともどうぞよろしくお願いいたします。',
      ...suffix
    ]
  }),
  requestTicketPayment: (payment: SockbasePaymentDocument, ticket: SockbaseTicketDocument, store: SockbaseStore, type: SockbaseStoreType, email: string) => ({
    subject: `[${store.storeName}] お支払いのお願い`,
    body: [
      `この度は、${store.storeName}への参加申し込みをいただき、誠にありがとうございます。`,
      '',
      '参加費のお支払いのご案内をいたします。',
      '',
      '[お支払い情報]',
      `お支払い方法: ${payment.paymentMethod === 1 ? 'オンライン' : '銀行振込'}`,
      `お支払い代金: ${payment.paymentAmount.toLocaleString()}円`,
      `お支払い期限: ${dayjs(store.schedules.endApplication).tz().format('YYYY年M月D日')}`,
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
          '[銀行振込情報/ ゆうちょ銀行からのお振り込み]',
          '加入者名: ノートセンディング',
          '口座記号・口座番号: 10740-30814531',
          '',
          '[銀行振込情報/ 他の金融機関からのお振り込み]',
          '振込先銀行: ゆうちょ銀行(金融機関コード9900)',
          '加入者名: ノートセンディング',
          '預金種目: 普通',
          '支店番号・支店名: 078(◯七八)',
          '口座番号: 3081453',
          '',
          `※お振り込みの特定のため、ご依頼人名の先頭に「${payment.bankTransferCode}」と入力してください。`,
          ''
        ],
      '[申し込み情報]',
      `イベント名: ${store.storeName}`,
      `チケット種別: ${type.name}`,
      `チケットID: ${ticket.hashId}`,
      '',
      'お申し込みいただいた内容に誤りがある場合は、お手数ですがご連絡いただきますようお願いいたします。',
      'ご不明点がありましたら、お気軽にご連絡ください。',
      '今後ともどうぞよろしくお願いいたします。',
      ...suffix
    ]
  }),
  acceptTicketPayment: (payment: SockbasePaymentDocument, store: SockbaseStoreDocument, type: SockbaseStoreType, ticket: SockbaseTicketDocument) => ({
    subject: `[${store.storeName}] お支払い完了のお知らせ`,
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
      `チケットストア名: ${store.storeName}`,
      `チケット種別: ${type.name}`,
      `チケットID: ${ticket.hashId}`,
      ...suffix
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
      ...suffix
    ]
  })
}

export default {
  templates
}
