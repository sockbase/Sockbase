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
import TermsOfService from './pages/public/static/TermsOfService'
import PrivacyPolicy from './pages/public/static/PrivacyPolicy'
import EventApplication from './pages/public/EventApplication'
import TicketApplication from './pages/public/TicketApplication'
import TicketAssign from './pages/public/TicketAssign'
import TicketView from './pages/public/TicketView'
import Dashboard from './pages/dashboard/Dashboard'
import DashboardEventList from './pages/dashboard/Events/EventList'
import DashboardEventApplications from './pages/dashboard/Events/EventApplications'
import DashboardApplicationList from './pages/dashboard/CircleApplications/ApplicationList'
import DashboardApplicationDetail from './pages/dashboard/CircleApplications/ApplicationDetail'
import DashboardPaymentList from './pages/dashboard/Payments/PaymentList'
import DashboardSettings from './pages/dashboard/Settings'
import DashboardContact from './pages/dashboard/Contact'
import DashboardInquiryList from './pages/dashboard/manage/inquiries/InquiryList'
import DashboardEditLinks from './pages/dashboard/CircleApplications/EditLinks'
import DashboardTicketList from './pages/dashboard/Tickets/TicketList'
import DashboardMyTicketList from './pages/dashboard/Tickets/MyTicketList'
import DashboardMyTicketDetail from './pages/dashboard/Tickets/MyTicketDetail'
import DashboardTicketDetail from './pages/dashboard/Tickets/TicketDetail'
import DebugDashboard from './pages/dashboard/Debug'
import NotFound from './pages/NotFound'

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
        path: 'assign-tickets',
        element: <TicketAssign />
      },
      {
        path: 'tickets',
        children: [
          {
            path: ':ticketHashId',
            element: <TicketView />
          }
        ]
      },
      ...[
        ...import.meta.env.DEV
          ? []
          : []],
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
                children: [
                  {
                    index: true,
                    element: <DashboardApplicationDetail />,
                  },
                  {
                    path: 'links',
                    element: <DashboardEditLinks />
                  }
                ]
              }
            ]
          },
          {
            path: 'tickets',
            children: [
              {
                index: true,
                element: <DashboardTicketList />
              },
              {
                path: ':hashedTicketId',
                element: <DashboardTicketDetail />
              }
            ]
          },
          {
            path: 'mytickets',
            children: [
              {
                index: true,
                element: <DashboardMyTicketList />
              },
              {
                path: ':hashedTicketId',
                element: <DashboardMyTicketDetail />
              }
            ]
          },
          {
            path: 'payments',
            element: <DashboardPaymentList />
          },
          {
            path: 'inquiries',
            element: <DashboardInquiryList />
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
  },
  {
    path: '*',
    element: <NotFound />
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
