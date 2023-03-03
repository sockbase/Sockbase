import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
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
initializeAppCheck()

const router = createBrowserRouter([
  {
    children: [
      {
        path: '/',
        element: <App />
      },
      {
        path: 'tos',
        element: <TermsOfService />
      },
      {
        path: 'privacy-policy',
        element: <PrivacyPolicy />
      },
      {
        path: 'formTemplate',
        element: <FormTemplate />
      },
      {
        path: 'dashboardTemplate',
        element: <DashboardTemplate />
      },
      {
        path: 'events',
        children: [
          {
            path: ':eventId',
            element: <EventApplication />
          }
        ]
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <ResetStyle />
      <GlobalStyle />
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>
)
