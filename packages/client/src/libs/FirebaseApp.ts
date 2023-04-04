import type { FirebaseApp } from 'firebase/app'
import * as App from 'firebase/app'
import type { AppCheck as FirebaseAppCheck } from 'firebase/app-check'
import * as AppCheck from 'firebase/app-check'

export const getFirebaseApp: () => FirebaseApp =
  () => {
    return App.getApps().length === 0
      ? App.initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
      })
      : App.getApps()[0]
  }

export const initializeAppCheck: () => FirebaseAppCheck =
  () => {
    const app = getFirebaseApp()
    return AppCheck.initializeAppCheck(
      app,
      {
        provider: new AppCheck.ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITEKEY),
        isTokenAutoRefreshEnabled: true
      })
  }
