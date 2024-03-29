import { useCallback, useEffect, useState } from 'react'
import { type FirebaseError } from 'firebase/app'
import {
  type Auth,
  type User,
  type UserCredential,
  type Unsubscribe,
  type IdTokenResult,
  getAuth as getFirebaseAuth,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onIdTokenChanged,
  sendEmailVerification
} from 'firebase/auth'
import {
  type Database,
  getDatabase as getFirebaseDatabase
} from 'firebase/database'
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
  loginByEmail: (email: string, password: string) => Promise<UserCredential>
  logout: () => void
  createUser: (email: string, password: string) => Promise<User>
  sendPasswordResetURLAsync: (email: string) => Promise<void>
  sendVerifyMail: () => Promise<void>
  getFirestore: () => Firestore
  getStorage: () => FirebaseStorage
  getFunctions: () => Functions
  getDatabase: () => Database
}

const useFirebase = (): IUseFirebase => {
  const [auth, setAuth] = useState<Auth | undefined>()
  const [isLoggedIn, setLoggedIn] = useState<boolean | undefined>()
  const [user, setUser] = useState<User | null | undefined>()
  const [roles, setRoles] = useState<Record<string, SockbaseRole> | null>()

  const getAuth = (): Auth => {
    if (auth) {
      return auth
    }

    const app = getFirebaseApp()
    const _auth = getFirebaseAuth(app)
    setAuth(_auth)

    return _auth
  }

  const loginByEmail = async (
    email: string,
    password: string
  ): Promise<UserCredential> => {
    const auth = getAuth()
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    ).catch((err: FirebaseError) => {
      throw err
    })
    return credential
  }

  const logout = (): void => {
    const auth = getAuth()
    signOut(auth)
      .then(() => {
        setUser(null)
        setLoggedIn(false)
        setRoles(null)
      })
      .catch((err: FirebaseError) => {
        throw err
      })
  }

  const createUser = async (email: string, password: string): Promise<User> => {
    const auth = getAuth()
    return await createUserWithEmailAndPassword(auth, email, password)
      .then((cred) => cred.user)
      .catch((err) => {
        throw err
      })
  }

  const sendPasswordResetURLAsync = async (email: string): Promise<void> => {
    const auth = getAuth()
    await sendPasswordResetEmail(auth, email).catch((err: FirebaseError) => {
      throw err
    })
  }

  const sendVerifyMail = useCallback(async (): Promise<void> => {
    if (!user) return
    sendEmailVerification(user).catch((err) => {
      throw err
    })
  }, [user])

  const getFirestore = (): Firestore => getFirebaseFirestore()

  const getStorage = (): FirebaseStorage => getFirebaseStorage()

  const getFunctions = (): Functions => {
    const app = getFirebaseApp()
    return getFirebaseFunctions(app)
  }

  const getDatabase = (): Database => getFirebaseDatabase()

  const onAuthenticationUpdated = (): Unsubscribe => {
    const auth = getAuth()
    const unSubscribe = onIdTokenChanged(auth, (user) => {
      setUser(user)
      setLoggedIn(!!user)

      if (!user) {
        setRoles(undefined)
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
        .catch((err) => {
          throw err
        })
    })
    return unSubscribe
  }
  useEffect(onAuthenticationUpdated, [])

  return {
    isLoggedIn,
    user,
    roles,
    getAuth,
    loginByEmail,
    logout,
    createUser,
    sendPasswordResetURLAsync,
    sendVerifyMail,
    getFirestore,
    getStorage,
    getFunctions,
    getDatabase
  }
}

export default useFirebase
