import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration
} from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

import './main.css'
import ResetStyle from './ResetStyle'
import GlobalStyle from './GlobalStyle'
import { getFirebaseApp, initializeAppCheck } from './libs/FirebaseApp'

import App from './containers/App'
import FormTemplate from './containers/FormTemplate'
import DashboardTemplate from './containers/DashboardTemplate'
import TermsOfService from './containers/static/TermsOfService'
import PrivacyPolicy from './containers/static/PrivacyPolicy'

import EventApplication from './containers/events/Application'

import DashboardEventList from './containers/dashboard/Events/EventList'
import DashboardEventApplications from './containers/dashboard/Events/EventApplications'
import DashboardApplicationList from './containers/dashboard/CircleApplications/ApplicationList'
import DashboardApplicationDetail from './containers/dashboard/CircleApplications/ApplicationDetail'

getFirebaseApp()
initializeAppCheck()

const Root: React.FC = () => {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
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
      },
      {
        path: 'dashboard',
        children: [
          {
            path: 'events',
            children: [
              {
                index: true,
                element: <DashboardEventList />
              },
              {
                path: ':eventId',
                element: <DashboardEventApplications />
              }
            ]
          },
          {
            path: 'applications',
            children: [
              {
                index: true,
                element: <DashboardApplicationList />
              },
              {
                path: ':applicationId',
                element: <DashboardApplicationDetail />
              }
            ]
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
