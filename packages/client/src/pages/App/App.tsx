import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration
} from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

import ResetStyle from '../../styles/ResetStyle'
import Colors from '../../styles/Colors'
import GlobalStyle from '../../styles/GlobalStyle'

import Index from '../Index/IndexPage'
import NotFound from './NotFoundPage'
import TermsOfService from '../Static/TermsOfServicePage'
import PrivacyPolicy from '../Static/PrivacyPolicyPage'
import PasswordReset from '../PasswordReset/PasswordResetPage'
import EventApplication from '../CircleApplication/CircleApplicationPage'
import TicketApplication from '../TicketApplication/TicketApplicationPage'
import TicketAssign from '../TicketAssign/TicketAssignPage'
import TicketView from '../TicketView/TicketViewPage'
import DashboardTop from '../DashboardTop/DashboardTopPage'
import DashboardEventList from '../DashboardEvents/DashboardEventListPage'
import DashboardEventApplications from '../DashboardEvents/DashboardEventCircleApplicationsPage'
import DashboardEventSpaces from '../DashboardEvents/EventSpaces/EventSpaces'
import DashboardApplicationList from '../DashboardCircleApplication/DashboardCircleApplicationListPage'
import DashboardApplicationDetail from '../DashboardCircleApplication/DashboardCircleApplicationDetailPage'
import DashboardPaymentList from '../DashboardPayments/DashboardPaymentListPage'
import DashboardSettings from '../DashboardSettings/DashboardSettingsPage'
import DashboardContact from '../DashboardContact/DashboardContactPage'
import DashboardInquiryList from '../DashboardManage/DashboardManageInquiryListPage'
import DashboardEditLinks from '../DashboardCircleApplication/DashboardCircleApplicationEditLinksPage'
import DashboardTicketList from '../DashboardTickets/DashboardTicketListPage'
import DashboardMyTicketList from '../DashboardTickets/DashboardMyTicketListPage'
import DashboardMyTicketDetail from '../DashboardTickets/DashboardMyTicketDetailPage'
import DashboardTicketDetail from '../DashboardTickets/DashboardTicketDetailPage'
import DashboardStoreDetail from '../DashboardStores/DashboardStoreDetailPage'
import DashboardStoreList from '../DashboardStores/DashboardStoreListPage'
import DashboardTicketCreate from '../DashboardStores/DashboardStoreTicketCreatePage'
import DashboardTicketTerminal from '../DashboardTickets/DashboardTicketTerminalPage'
import DebugDashboard from '../DashboardDebug/DashboardDebugPage'

import '../../main.css'
import { getFirebaseApp, initializeAppCheck } from '../../libs/FirebaseApp'

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
        element: <Index />
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
        path: 'reset-password',
        element: <PasswordReset />
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
            element: <DashboardTop />
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
                children: [
                  {
                    index: true,
                    element: <DashboardEventApplications />
                  },
                  {
                    path: 'spaces',
                    element: <DashboardEventSpaces />
                  }
                ]
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
              },
              {
                path: 'terminal',
                element: <DashboardTicketTerminal />
              }
            ]
          },
          {
            path: 'stores',
            children: [
              {
                index: true,
                element: <DashboardStoreList />
              },
              {
                path: ':storeId',
                children: [
                  {
                    index: true,
                    element: <DashboardStoreDetail />,
                  },
                  {
                    path: 'create',
                    element: <DashboardTicketCreate />
                  }
                ]
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

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <ResetStyle />
      <Colors />
      <GlobalStyle />
      <RouterProvider router={router} />
    </HelmetProvider>
  )
}

export default App
