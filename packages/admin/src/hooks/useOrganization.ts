import { useCallback } from 'react'
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore'
import { organizationConverter, organizationManagerConverter } from '../libs/converters'
import useFirebase from './useFirebase'
import type { SockbaseOrganizationDocument, SockbaseOrganizationManagerDocument, SockbaseRole } from 'sockbase'

interface IUseOrganization {
  getOrganizationsAsync: () => Promise<SockbaseOrganizationDocument[]>
  getOrganizationByIdAsync: (organizationId: string) => Promise<SockbaseOrganizationDocument>
  getManagersByOrganizationIdAsync: (organizationId: string) => Promise<SockbaseOrganizationManagerDocument[]>
  setManagerAsync: (organizationId: string, userId: string, role: SockbaseRole) => Promise<void>
  removeManagerAsync: (organizationId: string, userId: string) => Promise<void>
}

const useOrganization = (): IUseOrganization => {
  const { getFirestore } = useFirebase()
  const db = getFirestore()

  const getOrganizationsAsync = useCallback(async () => {
    const orgsRef = collection(db, 'organizations')
      .withConverter(organizationConverter)
    const orgs = await getDocs(orgsRef)
    return orgs.docs.map(doc => doc.data())
  }, [])

  const getOrganizationByIdAsync = useCallback(async (organizationId: string) => {
    const orgRef = doc(db, 'organizations', organizationId)
      .withConverter(organizationConverter)
    const orgDoc = await getDoc(orgRef)
    const org = orgDoc.data()
    if (!org) {
      throw new Error('Organization not found')
    }
    return org
  }, [])

  const getManagersByOrganizationIdAsync = useCallback(async (organizationId: string) => {
    const orgManagersRef = collection(db, 'organizations', organizationId, 'users')
      .withConverter(organizationManagerConverter)
    const orgDoc = await getDocs(orgManagersRef)
    return orgDoc.docs.map(doc => doc.data())
  }, [])

  const setManagerAsync = useCallback(async (organizationId: string, userId: string, role: SockbaseRole) => {
    const orgManagersRef = doc(db, 'organizations', organizationId, 'users', userId)
      .withConverter(organizationManagerConverter)
    await setDoc(orgManagersRef, { role }, { merge: true })
  }, [])

  const removeManagerAsync = useCallback(async (organizationId: string, userId: string) => {
    const orgManagersRef = doc(db, 'organizations', organizationId, 'users', userId)
    await deleteDoc(orgManagersRef)
  }, [])

  return {
    getOrganizationsAsync,
    getOrganizationByIdAsync,
    getManagersByOrganizationIdAsync,
    setManagerAsync,
    removeManagerAsync
  }
}

export default useOrganization
