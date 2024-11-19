import { useCallback } from 'react'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { informationConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseInformation, SockbaseInformationDocument } from 'sockbase'

interface IUseInformation {
  getInformationsAsync: () => Promise<SockbaseInformationDocument[]>
  getPublishedInformationsAsync: () => Promise<SockbaseInformationDocument[]>
  getInformationByIdAsync: (informationId: string) => Promise<SockbaseInformationDocument>
  getInformationByIdNullableAsync: (informationId: string) => Promise<SockbaseInformationDocument | null>
  createInformationAsync: (information: SockbaseInformationDocument) => Promise<void>
  updateInformationAsync: (informationId: string, information: SockbaseInformationDocument) => Promise<void>
  deleteInformationAsync: (informationId: string) => Promise<void>
}
const useInformation = (): IUseInformation => {
  const { getFirestore } = useFirebase()
  const db = getFirestore()

  const getInformationsAsync = useCallback(async () => {
    const informationsRef = collection(db, 'informations')
      .withConverter(informationConverter)
    const informationsSnapshot = await getDocs(informationsRef)
    return informationsSnapshot.docs
      .filter(doc => doc.exists())
      .map(doc => doc.data())
  }, [])

  const getPublishedInformationsAsync = useCallback(async () => {
    const informationsRef = collection(db, 'informations')
      .withConverter(informationConverter)
    const informationsQuery = query(
      informationsRef,
      where('isPublished', '==', true))
    const informationsSnapshot = await getDocs(informationsQuery)
    return informationsSnapshot.docs
      .filter(doc => doc.exists())
      .map(doc => doc.data())
  }, [])

  const getInformationByIdAsync = useCallback(async (informationId: string) => {
    const informationRef = doc(db, 'informations', informationId)
      .withConverter(informationConverter)
    const informationDoc = await getDoc(informationRef)
    if (!informationDoc.exists()) {
      throw new Error('Information does not exist')
    }

    return informationDoc.data()
  }, [])

  const getInformationByIdNullableAsync = useCallback(async (informationId: string) =>
    await getInformationByIdAsync(informationId)
      .catch(() => null),
  [getInformationByIdAsync])

  const createInformationAsync = useCallback(async (information: SockbaseInformation) => {
    const informationRef = collection(db, 'informations')
      .withConverter(informationConverter)
    await addDoc(informationRef, information)
  }, [])

  const updateInformationAsync = useCallback(async (informationId: string, information: SockbaseInformation) => {
    const informationRef = doc(db, 'informations', informationId)
      .withConverter(informationConverter)
    await setDoc(informationRef, information)
  }, [])

  const deleteInformationAsync = useCallback(async (informationId: string) => {
    const informationRef = doc(db, 'informations', informationId)
    await deleteDoc(informationRef)
  }, [])

  return {
    getInformationsAsync,
    getPublishedInformationsAsync,
    getInformationByIdAsync,
    getInformationByIdNullableAsync,
    createInformationAsync,
    updateInformationAsync,
    deleteInformationAsync
  }
}

export default useInformation
