import { firestore } from 'firebase-functions'
import { type QueryDocumentSnapshot } from 'firebase-admin/firestore'
import type { SockbaseInquiryDocument } from 'sockbase'
import InquiryService from '../services/InquiryService'

export const onCreate = firestore
  .document('/_inquiries/{inquiryId}')
  .onCreate(
    async (snapshot: QueryDocumentSnapshot) => {
      const inquiry = snapshot.data() as SockbaseInquiryDocument
      await InquiryService.noticeInquiryAsync(inquiry)
    }
  )
