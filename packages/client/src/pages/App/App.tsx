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

import IndexPage from '../Index/IndexPage'
import NotFoundPage from './NotFoundPage'
import TermsOfServicePage from '../Static/TermsOfServicePage'
import PrivacyPolicyPage from '../Static/PrivacyPolicyPage'
import PasswordResetPage from '../PasswordReset/PasswordResetPage'
import EventApplicationPage from '../CircleApplication/CircleApplicationPage'
import TicketApplicationPage from '../TicketApplication/TicketApplicationPage'
import TicketAssignPage from '../TicketAssign/TicketAssignPage'
import TicketViewPage from '../TicketView/TicketViewPage'
import DashboardTopPage from '../DashboardTop/DashboardTopPage'
import DashboardEventListPage from '../DashboardEvents/DashboardEventListPage'
import DashboardEventApplicationsPage from '../DashboardEvents/DashboardEventCircleApplicationsPage'
import DashboardEventSpacesPage from '../DashboardEventSpaces/DashboardEventSpacesPage'
import DashboardCircleApplicationListPage from '../DashboardCircleApplication/DashboardCircleApplicationListPage'
import DashboardPaymentListPage from '../DashboardPayments/DashboardPaymentListPage'
import DashboardSettingsPage from '../DashboardSettings/DashboardSettingsPage'
import DashboardContactPage from '../DashboardContact/DashboardContactPage'
import DashboardInquiryListPage from '../DashboardInquiry/DashboardInquiryListPage'
import DashboardInquiryDetailPage from '../DashboardInquiry/DashboardInquiryDetailPage'
import DashboardCircleApplicationDetailPage from '../DashboardCircleApplication/DashboardCircleApplicationDetailPage'
import DashboardCircleApplicationEditLinksPage from '../DashboardCircleApplication/DashboardCircleApplicationEditLinksPage'
import DashboardCircleApplicationEditOverviewPage from '../DashboardCircleApplication/DashboardCircleApplicationEditOverviewPage'
import DashboardCircleApplicationUpdateCutPage from '../DashboardCircleApplication/DashboardCircleApplicationUpdateCutPage'
import DashboardTicketListPage from '../DashboardTickets/DashboardTicketListPage'
import DashboardMyTicketListPage from '../DashboardTickets/DashboardMyTicketListPage'
import DashboardMyTicketDetailPage from '../DashboardTickets/DashboardMyTicketDetailPage'
import DashboardTicketDetailPage from '../DashboardTickets/DashboardTicketDetailPage'
import DashboardStoreDetailPage from '../DashboardStores/DashboardStoreDetailPage'
import DashboardStoreListPage from '../DashboardStores/DashboardStoreListPage'
import DashboardTicketCreatePage from '../DashboardStores/DashboardStoreTicketCreatePage'
import DashboardTicketTerminalPage from '../DashboardTickets/DashboardTicketTerminalPage'
import DashboardLicensePage from '../DashboardLicense/DashboardLicensePage'
import DashboardSearchPage from '../DashboardSearch/DashboardSearchPage'

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
        element: <IndexPage />
      },
      {
        path: 'tos',
        element: <TermsOfServicePage />
      },
      {
        path: 'privacy-policy',
        element: <PrivacyPolicyPage />
      },
      {
        path: 'reset-password',
        element: <PasswordResetPage />
      },
      {
        path: 'events',
        children: [
          {
            path: ':eventId',
            element: <EventApplicationPage />
          }
        ]
      },
      {
        path: 'stores',
        children: [
          {
            path: ':storeId',
            element: <TicketApplicationPage />
          }
        ]
      },
      {
        path: 'assign-tickets',
        element: <TicketAssignPage />
      },
      {
        path: 'tickets',
        children: [
          {
            path: ':ticketHashId',
            element: <TicketViewPage />
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
            element: <DashboardTopPage />
          },
          {
            path: 'settings',
            children: [
              {
                index: true,
                element: <DashboardSettingsPage />
              }
            ]
          },
          {
            path: 'contact',
            children: [
              {
                index: true,
                element: <DashboardContactPage />
              }
            ]
          },
          {
            path: 'events',
            children: [
              {
                index: true,
                element: <DashboardEventListPage />
              },
              {
                path: ':eventId',
                children: [
                  {
                    index: true,
                    element: <DashboardEventApplicationsPage />
                  },
                  {
                    path: 'spaces',
                    element: <DashboardEventSpacesPage />
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
                element: <DashboardCircleApplicationListPage />
              },
              {
                path: ':hashedAppId',
                children: [
                  {
                    index: true,
                    element: <DashboardCircleApplicationDetailPage />
                  },
                  {
                    path: 'links',
                    element: <DashboardCircleApplicationEditLinksPage />
                  },
                  {
                    path: 'overview',
                    element: <DashboardCircleApplicationEditOverviewPage />
                  },
                  {
                    path: 'cut',
                    element: <DashboardCircleApplicationUpdateCutPage />
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
                element: <DashboardTicketListPage />
              },
              {
                path: ':hashedTicketId',
                element: <DashboardTicketDetailPage />
              },
              {
                path: 'terminal',
                element: <DashboardTicketTerminalPage />
              }
            ]
          },
          {
            path: 'stores',
            children: [
              {
                index: true,
                element: <DashboardStoreListPage />
              },
              {
                path: ':storeId',
                children: [
                  {
                    index: true,
                    element: <DashboardStoreDetailPage />
                  },
                  {
                    path: 'create',
                    element: <DashboardTicketCreatePage />
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
                element: <DashboardMyTicketListPage />
              },
              {
                path: ':hashedTicketId',
                element: <DashboardMyTicketDetailPage />
              }
            ]
          },
          {
            path: 'payments',
            element: <DashboardPaymentListPage />
          },
          {
            path: 'inquiries',
            children: [
              {
                index: true,
                element: <DashboardInquiryListPage />
              },
              {
                path: ':inquiryId',
                element: <DashboardInquiryDetailPage />
              }
            ]
          },
          {
            path: 'license',
            element: <DashboardLicensePage />
          },
          {
            path: 'search',
            element: <DashboardSearchPage />
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
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
