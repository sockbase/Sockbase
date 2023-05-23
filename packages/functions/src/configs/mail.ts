import type { SockbaseApplicationDocument, SockbaseEvent } from 'sockbase'

const suffix = [
  '',
  '-----',
  'このメールはシステムによって自動送信されています。',
  'このメールに覚えのない場合は、このメールに返信していただきますようお願いいたします。',
  '',
  'Sockbase'
]

const templates = {
  acceptApplication: (event: SockbaseEvent, app: SockbaseApplicationDocument) => ({
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
      `スペース数: ${app.spaceId}`,
      `成人向け頒布物の有無: ${app.circle.hasAdult ? '有り' : '無し'}`,
      `頒布物のジャンル: ${app.circle.genre}`,
      `頒布物概要: ${app.overview.description}`,
      `総搬入量: ${app.overview.totalAmount}`,
      `合体希望サークル 合体申し込みID: ${app.unionCircleId}`,
      `プチオンリーコード: ${app.petitCode}`,
      `通信欄: ${app.remarks}`,
      '',
      '[イベント情報]',
      `イベント名: ${event.eventName}`,
      `日程: ${event.schedules.startEvent}〜${event.schedules.endEvent}`,
      '場所: ', // TODO: あとで追記
      '',
      'お申し込みいただいた内容に誤りがある場合は、お手数ですがご連絡いただけますようお願いいたします。',
      '何かご不明点がありましたら、お気軽にご連絡ください。',
      '今後ともどうぞよろしくお願いいたします。',
      ...suffix
    ]
  })
}

export default {
  templates
}
