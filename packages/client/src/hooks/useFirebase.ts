import { useEffect, useState } from 'react'
import {
  type Auth,
  type User,
  type UserCredential,
  getAuth as getFirebaseAuth,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onIdTokenChanged
} from 'firebase/auth'
import { type Firestore, getFirestore as getFirebaseFirestore } from 'firebase/firestore'

import { getFirebaseApp } from '../libs/FirebaseApp'

interface IUseFirebase {
  isLoggedIn: boolean | undefined
  user: User | null | undefined

  getAuth: () => Promise<Auth>
  loginByEmail: (email: string, password: string) => Promise<UserCredential>
  logout: () => Promise<void>
  sendPasswordResetURL: (email: string) => Promise<void>

  getFirestore: () => Firestore
  // TODO Cloud Storage接続情報
  //   getStorage: () => void
}

const useFirebase: () => IUseFirebase =
  () => {
    const [auth, setAuth] = useState<Auth | undefined>()
    const [isLoggedIn, setLoggedIn] = useState<boolean | undefined>()
    const [user, setUser] = useState<User | null | undefined>()

    const getAuth: () => Promise<Auth> =
      async () => {
        if (auth) {
          return auth
        }

        const app = await getFirebaseApp()
        const _auth = getFirebaseAuth(app)

        setAuth(_auth)
        return _auth
      }

    const loginByEmail: (email: string, password: string) => Promise<UserCredential> =
      async (email, password) => {
        const auth = await getAuth()
        const credential = await signInWithEmailAndPassword(auth, email, password)
          .catch(e => {
            throw e
          })
        return credential
      }

    const logout: () => Promise<void> =
      async () => {
        const auth = await getAuth()
        await signOut(auth)
          .catch(e => {
            throw e
          })
        setUser(null)
        setLoggedIn(false)
      }

    const sendPasswordResetURL: (email: string) => Promise<void> =
      async (email) => {
        const auth = await getAuth()
        await sendPasswordResetEmail(auth, email)
          .catch(e => {
            throw e
          })
      }

    const getFirestore: () => Firestore =
      () => getFirebaseFirestore()

    const onAuthenticationUpdated: () => void =
      () => {
        const f: () => Promise<void> =
          async () => {
            const auth = await getAuth()
            onIdTokenChanged(auth, (user) => {
              setUser(user)
              setLoggedIn(!!user)
            })
          }
        f().catch(e => {
          throw e
        })
      }
    useEffect(onAuthenticationUpdated, [])

    return {
      isLoggedIn,
      user,

      getAuth,
      loginByEmail,
      logout,
      sendPasswordResetURL,

      getFirestore
    }
  }

export default useFirebase
