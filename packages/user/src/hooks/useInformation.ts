import { useCallback } from 'react'
import * as FirestoreDB from 'firebase/firestore'
import { informationConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseInformationDocument } from 'sockbase'

interface IUseInformation {
  getPublishedInformationsAsync: () => Promise<SockbaseInformationDocument[]>
  getInformationByIdAsync: (informationId: string) => Promise<SockbaseInformationDocument>
  getInformationByIdNullableAsync: (informationId: string) => Promise<SockbaseInformationDocument | null>
}
const useInformation = (): IUseInformation => {
  const { getFirestore } = useFirebase()

  const db = getFirestore()

  const getPublishedInformationsAsync = useCallback(async () => {
    const informationsRef = FirestoreDB.collection(db, 'informations')
      .withConverter(informationConverter)
    const informationsQuery = FirestoreDB.query(
      informationsRef,
      FirestoreDB.where('isPublished', '==', true))
    const informationsSnapshot = await FirestoreDB.getDocs(informationsQuery)
    return informationsSnapshot.docs
      .filter(doc => doc.exists())
      .map(doc => doc.data())
  }, [])

  const getInformationByIdAsync = useCallback(async (informationId: string) => {
    const informationRef = FirestoreDB.doc(db, 'informations', informationId)
      .withConverter(informationConverter)
    const informationDoc = await FirestoreDB.getDoc(informationRef)
    if (!informationDoc.exists()) {
      throw new Error('Information does not exist')
    }

    return informationDoc.data()
  }, [])

  const getInformationByIdNullableAsync = useCallback(async (informationId: string) =>
    await getInformationByIdAsync(informationId)
      .catch(() => null),
  [getInformationByIdAsync])

  return {
    getPublishedInformationsAsync,
    getInformationByIdAsync,
    getInformationByIdNullableAsync
  }
}

export default useInformation
