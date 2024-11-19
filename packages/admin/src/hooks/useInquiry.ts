import { useCallback } from 'react'
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore'
import inquiryHelper from '../helpers/inquiryHelper'
import { inquiryConverter, inquiryMetaConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseInquiryDocument, SockbaseInquiryMetaDocument, SockbaseInquiryStatus } from 'sockbase'

interface IUseInquiry {
  getInquiryByIdAsync: (inquiryId: string) => Promise<SockbaseInquiryDocument>
  getInquiries: () => Promise<SockbaseInquiryDocument[]>
  getInquiryMetaByInquiryIdAsync: (inquiryId: string) => Promise<SockbaseInquiryMetaDocument>
  getInquiryType: (inquiryType: string) => { type: string, name: string, description: string }
  setStatusByIdAsync: (inquiryId: string, status: SockbaseInquiryStatus) => Promise<void>
}

const useInquiry = (): IUseInquiry => {
  const { getFirestore } = useFirebase()
  const db = getFirestore()

  const getInquiryByIdAsync = useCallback(async (inquiryId: string) => {
    const inquiryRef = doc(db, `/_inquiries/${inquiryId}`)
      .withConverter(inquiryConverter)
    const inquiryDoc = await getDoc(inquiryRef)
    const inquiry = inquiryDoc.data()
    if (!inquiry) {
      throw new Error('inquiry not found')
    }

    return inquiry
  }, [])

  const getInquiries = useCallback(async () => {
    const inquiriesRef = collection(db, '_inquiries')
      .withConverter(inquiryConverter)

    const inquiriesDocs = await getDocs(inquiriesRef)
    const inquries = inquiriesDocs.docs.map((i) => i.data())

    return inquries
  }, [])

  const getInquiryMetaByInquiryIdAsync = useCallback(async (inquiryId: string) => {
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

  const setStatusByIdAsync = useCallback(async (inquiryId: string, status: SockbaseInquiryStatus) => {
    const inquiryMetaRef = doc(db, `/_inquiries/${inquiryId}/private/meta`)
      .withConverter(inquiryMetaConverter)
    await setDoc(inquiryMetaRef, { status }, { merge: true })
  }, [])

  return {
    getInquiryByIdAsync,
    getInquiries,
    getInquiryMetaByInquiryIdAsync,
    getInquiryType,
    setStatusByIdAsync
  }
}

export default useInquiry
