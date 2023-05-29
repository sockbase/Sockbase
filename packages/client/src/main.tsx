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

import ResetStyle from './styles/ResetStyle'
import Colors from './styles/Colors'
import GlobalStyle from './styles/GlobalStyle'

import { getFirebaseApp, initializeAppCheck } from './libs/FirebaseApp'

import App from './pages/App'
import TermsOfService from './pages/static/TermsOfService'
import PrivacyPolicy from './pages/static/PrivacyPolicy'
import EventApplication from './pages/events/Application'
import TicketApplication from './pages/stores/Application'
import Dashboard from './pages/dashboard/Dashboard'
import DashboardEventList from './pages/dashboard/Events/EventList'
import DashboardEventApplications from './pages/dashboard/Events/EventApplications'
import DashboardApplicationList from './pages/dashboard/CircleApplications/ApplicationList'
import DashboardApplicationDetail from './pages/dashboard/CircleApplications/ApplicationDetail'
import DashboardPaymentList from './pages/dashboard/Payments/PaymentList'
import DashboardSettings from './pages/dashboard/Settings'
import DashboardContact from './pages/dashboard/Contact'
import DebugDashboard from './pages/dashboard/Debug'
import DashboardTemplate from './pages/DashboardTemplate'
import FormTemplate from './pages/FormTemplate'

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
        path: 'events',
        children: [
          {
            path: ':eventId',
            element: <EventApplication />
          }
        ]
      },
      ...[
        ...import.meta.env.DEV
          ? [
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
              path: 'formTemplate',
              element: <FormTemplate />
            },
            {
              path: 'dashboardTemplate',
              element: <DashboardTemplate />
            }
          ]
          : [{}]],
      {
        path: 'dashboard',
        children: [
          {
            index: true,
            element: <Dashboard />
          },
          {
            path: 'settings',
            children: [
              {
                index: true,
                element: <DashboardSettings />
              }
            ]
          },
          {
            path: 'contact',
            children: [
              {
                index: true,
                element: <DashboardContact />
              }
            ]
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
          },
          ...[
            import.meta.env.DEV
              ? {
                path: 'debug',
                element: <DebugDashboard />
              }
              : {}
          ],
        ]
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <ResetStyle />
      <Colors />
      <GlobalStyle />
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>
)
