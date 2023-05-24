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

import App from './pages/App'

import FormTemplate from './pages/FormTemplate'
import DashboardTemplate from './pages/DashboardTemplate'

import TermsOfService from './pages/static/TermsOfService'
import PrivacyPolicy from './pages/static/PrivacyPolicy'

import EventApplication from './pages/events/Application'
import TicketApplication from './pages/stores/Application'

import DashboardEventList from './pages/dashboard/Events/EventList'
import DashboardEventApplications from './pages/dashboard/Events/EventApplications'
import DashboardApplicationList from './pages/dashboard/CircleApplications/ApplicationList'
import DashboardApplicationDetail from './pages/dashboard/CircleApplications/ApplicationDetail'
import DashboardPaymentList from './pages/dashboard/Payments/PaymentList'
import Dashboard from './pages/dashboard/Dashboard'
import DebugDashboard from './pages/dashboard/Debug'

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
        path: 'stores',
        children: [
          {
            path: ':storeId',
            element: <TicketApplication />
          }
        ]
      },
      {
        path: 'dashboard',
        children: [
          {
            index: true,
            element: <Dashboard />
          },
          {
            path: 'debug',
            element: <DebugDashboard />
          },
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
                path: ':hashedAppId',
                element: <DashboardApplicationDetail />
              }
            ]
          },
          {
            path: 'payments',
            children: [
              {
                index: true,
                element: <DashboardPaymentList />
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
