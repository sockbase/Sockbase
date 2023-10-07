import type { SockbaseInquiryDocument } from 'sockbase'

import * as functions from 'firebase-functions'
import { type QueryDocumentSnapshot } from 'firebase-admin/firestore'

import { sendMessageToDiscord } from '../libs/sendWebhook'
import { getUserDataAsync } from '../models/user'
import { convertTypeText } from '../models/inquiry'

export const onCreate = functions.firestore
  .document('/_inquiries/{inquiryId}')
  .onCreate(
    async (
      snapshot: QueryDocumentSnapshot,
      context: functions.EventContext<{ inquiryId: string }>
    ) => {
      const inquiry = snapshot.data() as SockbaseInquiryDocument
      const user = await getUserDataAsync(inquiry.userId)

      const body = {
        username: 'Sockbase: お問い合わせ',
        embeds: [{
          title: 'お問い合わせを受信しました！',
          url: '',
          color: 52479,
          fields: [
            {
              name: 'お名前',
              value: user.name,
              inline: true
            },
            {
              name: 'メールアドレス',
              value: user.email,
              inline: true
            },
            // {
            //   name: 'ユーザID',
            //   value: user.id,
            //   inline: true
            // },
            {
              name: 'お問い合わせ種類',
              value: convertTypeText(inquiry.inquiryType),
              inline: true
            },
            {
              name: 'お問い合わせ内容',
              value: `\`\`\`${inquiry.body}\`\`\``,
              inline: false
            }
          ]
        }]
      }

      sendMessageToDiscord('system', body)
        .catch(err => { throw err })
    }
  )
