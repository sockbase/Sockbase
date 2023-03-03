import { useEffect, useState } from 'react'
import {
  type Auth,
  type User,
  type UserCredential,
  type Unsubscribe,
  getAuth as getFirebaseAuth,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onIdTokenChanged
} from 'firebase/auth'
import { getFirebaseApp } from '../libs/FirebaseApp'

interface IUseFirebase {
  isLoggedIn: boolean | undefined
  user: User | null | undefined

  getAuth: () => Auth
  loginByEmail: (email: string, password: string) => Promise<UserCredential>
  logout: () => Promise<void>
  sendPasswordResetURL: (email: string) => void
  // TODO Firestore接続情報
  //   getFirestore: () => void
  // TODO Cloud Storage接続情報
  //   getStorage: () => void
}

const useFirebase: () => IUseFirebase =
  () => {
    const [auth, setAuth] = useState<Auth | undefined>()
    const [isLoggedIn, setLoggedIn] = useState<boolean | undefined>()
    const [user, setUser] = useState<User | null | undefined>()

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
          .catch(e => {
            throw e
            // TODO 例外処理書く
          })
        return credential
      }

    const logout: () => Promise<void> =
      async () => {
        const auth = getAuth()
        await signOut(auth)
          .catch(e => {
            throw e
            // TODO 例外処理書く
          })
        setUser(null)
        setLoggedIn(false)
      }

    const sendPasswordResetURL: (email: string) => void =
      (email) => {
        const auth = getAuth()
        sendPasswordResetEmail(auth, email)
          .catch(e => {
            throw e
          })
      }

    const onAuthenticationUpdated: () => Unsubscribe =
      () => {
        const auth = getAuth()
        const unSubscribe = onIdTokenChanged(auth, (user) => {
          setUser(user)
          setLoggedIn(!!user)
        })

        return unSubscribe
      }
    useEffect(onAuthenticationUpdated, [])

    return {
      isLoggedIn,
      user,
      getAuth,
      loginByEmail,
      logout,
      sendPasswordResetURL
    }
  }

export default useFirebase
