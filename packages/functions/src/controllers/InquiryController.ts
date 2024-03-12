import { type QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { type EventContext, firestore } from 'firebase-functions'
import InquiryService from '../services/InquiryService'
import type { SockbaseInquiryDocument } from 'sockbase'

export const onCreate = firestore
  .document('/_inquiries/{inquiryId}')
  .onCreate(
    async (snapshot: QueryDocumentSnapshot, context: EventContext<{ inquiryId: string }>) => {
      const inquiry = snapshot.data() as SockbaseInquiryDocument

      await InquiryService.addInquiryMetaAsync(context.params.inquiryId)
        .then(() => console.log('inquiry meta data added'))

      await InquiryService.noticeInquiryAsync(inquiry)
        .then(() => console.log('inquiry noticed'))
    }
  )
