import { useCallback } from 'react'
import type {
  SockbaseInquiryDocument,
  SockbaseInquiryMetaDocument,
  SockbaseInquiryStatus
} from 'sockbase'
import useFirebase from './useFirebase'
import * as FirestoreDB from 'firebase/firestore'
import inquiryHelper from '../helpers/inquiryHelper'

interface IUseInquiry {
  submitInquiry: (inquiryType: string, inquiryBody: string) => Promise<void>
  getInquiries: () => Promise<SockbaseInquiryDocument[]>
  getInquiryByIdAsync: (inquiryId: string) => Promise<SockbaseInquiryDocument>
  getInquiryMetaByInquiryIdAsync: (
    inquiryId: string
  ) => Promise<SockbaseInquiryMetaDocument>
  getInquiryType: (inquiryType: string) => {
    type: string
    name: string
    description: string
  }
  setStatusByIdAsync: (
    inquiryId: string,
    status: SockbaseInquiryStatus
  ) => Promise<void>
}

export const inquiryConverter: FirestoreDB.FirestoreDataConverter<SockbaseInquiryDocument> =
  {
    toFirestore: (inquiry: SockbaseInquiryDocument) => ({
      status: inquiry.status,
      createdAt: null,
      updatedAt: null
    }),
    fromFirestore: (
      snapshot: FirestoreDB.QueryDocumentSnapshot
    ): SockbaseInquiryDocument => {
      const inquiry = snapshot.data()
      return {
        id: snapshot.id,
        userId: inquiry.userId,
        inquiryType: inquiry.inquiryType,
        body: inquiry.body,
        status: inquiry.status,
        createdAt: inquiry.createdAt
          ? new Date(inquiry.createdAt.seconds * 1000)
          : null,
        updatedAt: inquiry.updatedAt
          ? new Date(inquiry.updatedAt.seconds * 1000)
          : null
      }
    }
  }

export const inquiryMetaConverter: FirestoreDB.FirestoreDataConverter<SockbaseInquiryMetaDocument> =
  {
    toFirestore: (meta: SockbaseInquiryMetaDocument) => ({
      status: meta.status
    }),
    fromFirestore: (
      snapshot: FirestoreDB.QueryDocumentSnapshot
    ): SockbaseInquiryMetaDocument => {
      const meta = snapshot.data()
      return {
        status: meta.status,
        createdAt: meta.createdAt
          ? new Date(meta.createdAt.seconds * 1000)
          : null,
        updatedAt: meta.updatedAt
          ? new Date(meta.updatedAt.seconds * 1000)
          : null
      }
    }
  }

const useInquiry = (): IUseInquiry => {
  const { user, getFirestore } = useFirebase()

  const submitInquiry = useCallback(
    async (inquiryType: string, inquiryBody: string): Promise<void> => {
      if (!user) return

      const db = getFirestore()
      const inquiryRef = FirestoreDB.collection(db, '_inquiries').withConverter(
        inquiryConverter
      )

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
    },
    [user]
  )

  const getInquiries = async (): Promise<SockbaseInquiryDocument[]> => {
    const db = getFirestore()
    const inquiriesRef = FirestoreDB.collection(db, '_inquiries').withConverter(
      inquiryConverter
    )

    const inquiriesDocs = await FirestoreDB.getDocs(inquiriesRef)
    const inquries = inquiriesDocs.docs.map((i) => i.data())

    return inquries
  }

  const getInquiryByIdAsync = async (
    inquiryId: string
  ): Promise<SockbaseInquiryDocument> => {
    const db = getFirestore()
    const inquiryRef = FirestoreDB.doc(
      db,
      `/_inquiries/${inquiryId}`
    ).withConverter(inquiryConverter)
    const inquiryDoc = await FirestoreDB.getDoc(inquiryRef)
    const inquiry = inquiryDoc.data()
    if (!inquiry) {
      throw new Error('inquiry not found')
    }

    return inquiry
  }

  const getInquiryMetaByInquiryIdAsync = async (
    inquiryId: string
  ): Promise<SockbaseInquiryMetaDocument> => {
    const db = getFirestore()
    const inquiryMetaRef = FirestoreDB.doc(
      db,
      `/_inquiries/${inquiryId}/private/meta`
    ).withConverter(inquiryMetaConverter)
    const inquiryMetaDoc = await FirestoreDB.getDoc(inquiryMetaRef)
    const inquiryMeta = inquiryMetaDoc.data()
    if (!inquiryMeta) {
      throw new Error('inquiryMeta not found')
    }

    return inquiryMeta
  }

  const getInquiryType = (
    inquiryType: string
  ): { type: string, name: string, description: string } =>
    inquiryHelper.inquiryTypes.filter((t) => t.type === inquiryType)[0]

  const setStatusByIdAsync = async (
    inquiryId: string,
    status: SockbaseInquiryStatus
  ): Promise<void> => {
    const db = getFirestore()
    const inquiryMetaRef = FirestoreDB.doc(
      db,
      `/_inquiries/${inquiryId}/private/meta`
    ).withConverter(inquiryMetaConverter)

    await FirestoreDB.setDoc(
      inquiryMetaRef,
      {
        status
      },
      {
        merge: true
      }
    )
  }

  return {
    submitInquiry,
    getInquiries,
    getInquiryByIdAsync,
    getInquiryMetaByInquiryIdAsync,
    getInquiryType,
    setStatusByIdAsync
  }
}

export default useInquiry
