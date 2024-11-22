import React from 'react'
import ReactDOM from 'react-dom/client'

import './styles/main.scss'

import App from './App'
import { getFirebaseApp, initializeAppCheck } from './libs/FirebaseApp'

getFirebaseApp()
initializeAppCheck()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
