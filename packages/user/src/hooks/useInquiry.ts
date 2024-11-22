import { useCallback } from 'react'
import * as FirestoreDB from 'firebase/firestore'
import { inquiryConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseInquiryDocument } from 'sockbase'

interface IUseInquiry {
  submitInquiry: (inquiryType: string, inquiryBody: string) => Promise<void>
}

const useInquiry = (): IUseInquiry => {
  const { user, getFirestore } = useFirebase()

  const submitInquiry =
    useCallback(async (inquiryType: string, inquiryBody: string) => {
      if (!user) return

      const db = getFirestore()
      const inquiryRef = FirestoreDB.collection(db, '_inquiries')
        .withConverter(inquiryConverter)

      const inquiryDoc: SockbaseInquiryDocument = {
        userId: user.uid,
        inquiryType,
        body: inquiryBody.replaceAll(/\n/g, '\\n'),
        id: '',
        createdAt: null,
        updatedAt: null,
        status: 0
      }

      await FirestoreDB.addDoc(inquiryRef, inquiryDoc)
    }, [user])

  return {
    submitInquiry
  }
}

export default useInquiry
