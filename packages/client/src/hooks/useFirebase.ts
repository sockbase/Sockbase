import { useEffect, useState } from 'react'
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
  onIdTokenChanged
} from 'firebase/auth'
import { type Firestore, getFirestore as getFirebaseFirestore } from 'firebase/firestore'
import { type FirebaseStorage, getStorage as getFirebaseStorage } from 'firebase/storage'
import { getFirebaseApp } from '../libs/FirebaseApp'

interface IUseFirebase {
  isLoggedIn: boolean | undefined
  user: User | null | undefined
  claims: Record<string, number> | undefined
  getAuth: () => Auth
  loginByEmail: (email: string, password: string) => Promise<UserCredential>
  logout: () => void
  createUser: (email: string, password: string) => Promise<User>
  sendPasswordResetURL: (email: string) => void
  getFirestore: () => Firestore
  getStorage: () => FirebaseStorage
}

const useFirebase: () => IUseFirebase =
  () => {
    const [auth, setAuth] = useState<Auth | undefined>()
    const [isLoggedIn, setLoggedIn] = useState<boolean | undefined>()
    const [user, setUser] = useState<User | null | undefined>()
    const [claims, setClaims] = useState<Record<string, number>>()

    const getAuth: () => Auth =
      () => {
        if (auth) {
          return auth
        }

        const app = getFirebaseApp()
        const _auth = getFirebaseAuth(app)
        setAuth(_auth)

        return _auth
      }

    const loginByEmail: (email: string, password: string) => Promise<UserCredential> =
      async (email, password) => {
        const auth = getAuth()
        const credential = await signInWithEmailAndPassword(auth, email, password)
          .catch((err: FirebaseError) => {
            throw err
          })
        return credential
      }

    const logout: () => void =
      () => {
        const auth = getAuth()
        signOut(auth)
          .then(() => {
            setUser(null)
            setLoggedIn(false)
          })
          .catch((err: FirebaseError) => {
            throw err
          })
      }

    const createUser: (email: string, password: string) => Promise<User> =
      async (email, password) => {
        const auth = getAuth()
        return await createUserWithEmailAndPassword(auth, email, password)
          .then(cred => cred.user)
          .catch(err => {
            throw err
          })
      }

    const sendPasswordResetURL: (email: string) => void =
      (email) => {
        const auth = getAuth()
        sendPasswordResetEmail(auth, email)
          .catch((err: FirebaseError) => {
            throw err
          })
      }

    const getFirestore: () => Firestore =
      () => getFirebaseFirestore()

    const getStorage: () => FirebaseStorage =
      () => getFirebaseStorage()

    const onAuthenticationUpdated: () => Unsubscribe =
      () => {
        const auth = getAuth()
        const unSubscribe = onIdTokenChanged(auth, (user) => {
          setUser(user)
          setLoggedIn(!!user)

          if (!user) return

          user.getIdTokenResult(true)
            .then((result: IdTokenResult) => {
              setClaims(result.claims.permissions)
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
      claims,
      getAuth,
      loginByEmail,
      logout,
      createUser,
      sendPasswordResetURL,
      getFirestore,
      getStorage
    }
  }

export default useFirebase
