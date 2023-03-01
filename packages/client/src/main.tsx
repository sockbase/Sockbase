import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

import './main.css'
import ResetStyle from './ResetStyle'
import GlobalStyle from './GlobalStyle'
import { getFirebaseApp, initializeAppCheck } from './libs/FirebaseApp'

import App from './containers/App'
import FormTemplate from './containers/FormTemplate'
import DashboardTemplate from './containers/DashboardTemplate'
import EventApplication from './containers/events/Application'
import TermsOfService from './containers/static/TermsOfService'
import PrivacyPolicy from './containers/static/PrivacyPolicy'

getFirebaseApp()
  .catch(err => {
    throw err
  })
initializeAppCheck()
  .catch(err => {
    throw err
  })

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <ResetStyle />
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/tos" element={<TermsOfService />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />

          <Route path="/formTemplate" element={<FormTemplate />} />
          <Route path="/dashboardTemplate" element={<DashboardTemplate />} />

          <Route path="/events/:eventId" element={<EventApplication />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)
