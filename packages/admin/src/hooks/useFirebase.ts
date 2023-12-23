import { type EffectCallback, useCallback, useEffect, useState } from 'react'
import { type FirebaseError } from 'firebase/app'
import {
  type Auth,
  type User,
  type UserCredential,
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
  type Firestore,
  getFirestore as getFirebaseFirestore
} from 'firebase/firestore'
import {
  type FirebaseStorage,
  getStorage as getFirebaseStorage
} from 'firebase/storage'
import {
  type Functions,
  getFunctions as getFirebaseFunctions
} from 'firebase/functions'
import {
  type Database,
  ref as dbRef,
  onValue as dbOnValue,
  getDatabase as getFirebaseDatabase
} from 'firebase/database'
import type { SockbaseRole } from 'sockbase'
import { getFirebaseApp } from '../libs/FirebaseApp'
import useNotification from './useNotification'

interface IUseFirebase {
  isLoggedIn: boolean | undefined
  user: User | null | undefined
  roles: Record<string, SockbaseRole> | null | undefined
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

  const { addNotification } = useNotification()

  const getAuth = useCallback((): Auth => {
    if (auth) {
      return auth
    }

    const app = getFirebaseApp()
    const _auth = getFirebaseAuth(app)
    setAuth(_auth)

    return _auth
  }, [auth])

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

  const sendVerifyMail = useCallback(async () => {
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

  const getDatabase = (): Database => {
    const app = getFirebaseApp()
    return getFirebaseDatabase(app)
  }

  const onAuthenticationUpdated: EffectCallback = () => {
    const auth = getAuth()
    const unSubscribe = onIdTokenChanged(auth, (user) => {
      setUser(user)
      setLoggedIn(!!user)

      if (!user) {
        setRoles(undefined)
        // refreshUserMetaUnsubscribe?.()
        // setRefreshUserMetaUnsubscribe(null)
        return unSubscribe
      }

      if (roles) return unSubscribe

      user
        .getIdTokenResult()
        .then((result: IdTokenResult) => {
          if (result.claims.roles === undefined) {
            setRoles(null)
            return unSubscribe
          }
          setRoles(result.claims.roles)
        })
        .catch((err) => {
          throw err
        })
    })

    return () => {
      unSubscribe()
    }
  }
  useEffect(onAuthenticationUpdated, [auth])

  const onUserChanged: EffectCallback = () => {
    if (!user) return

    const db = getDatabase()
    const userMetaRef = dbRef(db, `_userMetas/${user.uid}/refreshTime`)

    const unSubscribeToken = dbOnValue(userMetaRef, () => {
      user.getIdToken()
        .then(() => addNotification('ユーザ情報を取得しました'))
        .catch(err => { throw err })
    },
    err => {
      unSubscribeToken()
      console.error(err)
      throw err
    })

    return () => {
      unSubscribeToken()
    }
  }
  useEffect(onUserChanged, [user])

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
