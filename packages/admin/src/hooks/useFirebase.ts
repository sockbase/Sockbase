import { useCallback, useEffect, useState } from 'react'
import {
  type Auth,
  type User,
  type UserCredential,
  type IdTokenResult,
  getAuth as getFirebaseAuth,
  signInWithEmailAndPassword,
  signOut,
  onIdTokenChanged
} from 'firebase/auth'
import {
  type Firestore,
  getFirestore as getFirebaseFirestore
} from 'firebase/firestore'
import {
  type Functions,
  getFunctions as getFirebaseFunctions
} from 'firebase/functions'
import {
  type FirebaseStorage,
  getStorage as getFirebaseStorage
} from 'firebase/storage'
import { getFirebaseApp } from '../libs/FirebaseApp'
import type { SockbaseRole } from 'sockbase'

interface IUseFirebase {
  isLoggedIn: boolean | undefined
  user: User | null | undefined
  roles: Record<string, number> | null | undefined
  getAuth: () => Auth
  loginByEmailAsync: (email: string, password: string) => Promise<UserCredential>
  logoutAsync: () => Promise<void>
  getFirestore: () => Firestore
  getStorage: () => FirebaseStorage
  getFunctions: () => Functions
}

const useFirebase = (): IUseFirebase => {
  const [auth, setAuth] = useState<Auth | undefined>()
  const [isLoggedIn, setLoggedIn] = useState<boolean | undefined>()
  const [user, setUser] = useState<User | null | undefined>()
  const [roles, setRoles] = useState<Record<string, SockbaseRole> | null>()

  const getAuth =
    useCallback(() => {
      if (auth) {
        return auth
      }

      const app = getFirebaseApp()
      const _auth = getFirebaseAuth(app)
      setAuth(_auth)

      return _auth
    }, [])

  const loginByEmailAsync =
    useCallback(async (email: string, password: string) => {
      const auth = getAuth()
      const credential = await signInWithEmailAndPassword(auth, email, password)
        .catch(err => { throw err })
      return credential
    }, [])

  const logoutAsync =
    useCallback(async () => {
      const auth = getAuth()
      await signOut(auth)
        .then(() => {
          setUser(null)
          setLoggedIn(false)
          setRoles(null)
        })
        .catch(err => { throw err })
    }, [])

  const getFirestore = getFirebaseFirestore

  const getStorage = getFirebaseStorage

  const getFunctions =
    useCallback(() => {
      const app = getFirebaseApp()
      return getFirebaseFunctions(app)
    }, [])

  useEffect(() => {
    const auth = getAuth()
    const unSubscribe = onIdTokenChanged(auth, user => {
      setUser(user)
      setLoggedIn(!!user)

      if (!user) {
        setRoles(null)
        return unSubscribe
      }

      if (roles) return unSubscribe

      user
        .getIdTokenResult()
        .then((result: IdTokenResult) => {
          if (result.claims.roles === undefined) {
            setRoles(null)
            return
          }
          setRoles(result.claims.roles)
        })
        .catch(err => { throw err })
    })
    return unSubscribe
  }, [])

  return {
    isLoggedIn,
    user,
    roles,
    getAuth,
    loginByEmailAsync,
    logoutAsync,
    getFirestore,
    getStorage,
    getFunctions
  }
}

export default useFirebase
