import React from 'react'
import ReactDOM from 'react-dom/client'

import './styles/main.scss'
import './styles/colors.scss'

import App from './App'
import { ModalProvider } from './contexts/ModalContext'
import { RouterProvider } from './contexts/RouterContext'
import { getFirebaseApp, initializeAppCheck } from './libs/FirebaseApp'

getFirebaseApp()
initializeAppCheck()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider>
      <ModalProvider>
        <App />
      </ModalProvider>
    </RouterProvider>
  </React.StrictMode>
)
