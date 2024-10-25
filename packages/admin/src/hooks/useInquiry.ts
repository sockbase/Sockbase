import { useCallback } from 'react'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import inquiryHelper from '../helpers/inquiryHelper'
import { inquiryConverter, inquiryMetaConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseInquiryDocument, SockbaseInquiryMetaDocument } from 'sockbase'

interface IUseInquiry {
  getInquiries: () => Promise<SockbaseInquiryDocument[]>
  getInquiryMetaByInquiryIdAsync: (
    inquiryId: string
  ) => Promise<SockbaseInquiryMetaDocument>
  getInquiryType: (inquiryType: string) => {
    type: string
    name: string
    description: string
  }
}

const useInquiry = (): IUseInquiry => {
  const { getFirestore } = useFirebase()
  const db = getFirestore()

  const getInquiries =
    useCallback(async () => {
      const inquiriesRef = collection(db, '_inquiries')
        .withConverter(inquiryConverter)

      const inquiriesDocs = await getDocs(inquiriesRef)
      const inquries = inquiriesDocs.docs.map((i) => i.data())

      return inquries
    }, [])

  const getInquiryMetaByInquiryIdAsync =
    useCallback(async (inquiryId: string) => {
      const db = getFirestore()
      const inquiryMetaRef = doc(db, `/_inquiries/${inquiryId}/private/meta`)
        .withConverter(inquiryMetaConverter)
      const inquiryMetaDoc = await getDoc(inquiryMetaRef)
      const inquiryMeta = inquiryMetaDoc.data()
      if (!inquiryMeta) {
        throw new Error('inquiryMeta not found')
      }

      return inquiryMeta
    }, [])

  const getInquiryType =
    (inquiryType: string): { type: string, name: string, description: string } =>
      inquiryHelper.inquiryTypes.filter((t) => t.type === inquiryType)[0]

  return {
    getInquiries,
    getInquiryMetaByInquiryIdAsync,
    getInquiryType
  }
}

export default useInquiry
