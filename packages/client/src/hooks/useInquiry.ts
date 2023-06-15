import { useCallback } from 'react'
import type { SockbaseInquiryDocument } from 'sockbase'
import useFirebase from './useFirebase'
import * as FirestoreDB from 'firebase/firestore'

const inquiryConverter: FirestoreDB.FirestoreDataConverter<SockbaseInquiryDocument> = {
  toFirestore: (inquiry: SockbaseInquiryDocument): FirestoreDB.DocumentData => ({
    userId: inquiry.userId,
    inquiryType: inquiry.inquiryType,
    body: inquiry.body,
    status: inquiry.status,
    createdAt: FirestoreDB.serverTimestamp(),
    updatedAt: FirestoreDB.serverTimestamp()
  }),
  fromFirestore: (snapshot: FirestoreDB.QueryDocumentSnapshot): SockbaseInquiryDocument => {
    const data = snapshot.data()
    return {
      id: snapshot.id,
      userId: data.userId,
      inquiryType: data.inquiryType,
      body: data.body,
      status: data.status,
      createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : null,
      updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : null
    }
  }
}
interface IUseInquiry {
  submitInquiry: (inquiryType: string, inquiryBody: string) => Promise<void>
  getInquiries: () => Promise<SockbaseInquiryDocument[]>
}

const useInquiry: () => IUseInquiry =
  () => {
    const { user, getFirestore } = useFirebase()

    const submitInquiry: (inquiryType: string, inquiryBody: string) => Promise<void> =
      useCallback(async (inquiryType, inquiryBody) => {
        if (!user) return

        const db = getFirestore()
        const inquiryRef = FirestoreDB.collection(db, '_inquiries')
          .withConverter(inquiryConverter)

        const inquiryDoc: SockbaseInquiryDocument = {
          userId: user.uid,
          inquiryType,
          body: inquiryBody.replaceAll(/\n/g, '\\n'),
          id: '',
          status: 0,
          createdAt: null,
          updatedAt: null,
        }

        await FirestoreDB.addDoc(inquiryRef, inquiryDoc)
      }, [user])

    const getInquiries: () => Promise<SockbaseInquiryDocument[]> =
      async () => {
        const db = getFirestore()
        const inquiriesRef = FirestoreDB.collection(db, '_inquiries')
          .withConverter(inquiryConverter)

        const inquiriesDocs = await FirestoreDB.getDocs(inquiriesRef)
        const inquries = inquiriesDocs.docs
          .map(i => i.data())

        return inquries
      }

    return {
      submitInquiry,
      getInquiries
    }
  }

export default useInquiry
