import { type SockbaseInquiryDocument } from 'sockbase'
import { getUserDataAsync } from '../models/user'
import { convertTypeText } from '../models/inquiry'
import { sendMessageToDiscord } from '../libs/sendWebhook'
import FirebaseAdmin from '../libs/FirebaseAdmin'
import { inquiryMetaConverter } from '../libs/converters'

const adminApp = FirebaseAdmin.getFirebaseAdmin()
const firestore = adminApp.firestore()

const addInquiryMetaAsync = async (inquiryId: string): Promise<void> => {
  const now = new Date()

  await firestore.doc(`/_inquiries/${inquiryId}/private/meta`)
    .withConverter(inquiryMetaConverter)
      .set({
        status: 0,
        createdAt: now,
        updatedAt: now
      }, {
        merge: true
      })
}

const noticeInquiryAsync = async (inquiry: SockbaseInquiryDocument): Promise<void> => {
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
        {
          name: 'ユーザID',
          value: user.id,
          inline: true
        },
        {
          name: 'お問い合わせ種類',
          value: convertTypeText(inquiry.inquiryType),
          inline: true
        },
        {
          name: 'お問い合わせ内容',
          value: `\`\`\`${inquiry.body.replaceAll('\\n', '\n')}\`\`\``,
          inline: false
        }
      ]
    }]
  }

  sendMessageToDiscord('system', body)
    .catch(err => { throw err })
}

export default {
  addInquiryMetaAsync,
  noticeInquiryAsync
}
