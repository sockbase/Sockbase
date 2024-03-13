import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration
} from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import {
  getFirebaseApp,
  initializeAppCheck
} from '../../libs/FirebaseApp'
import Colors from '../../styles/Colors'
import GlobalStyle from '../../styles/GlobalStyle'
import ResetStyle from '../../styles/ResetStyle'
import EventApplicationPage from '../CircleApplication/CircleApplicationPage'
import DashboardCircleApplicationDetailPage from '../DashboardCircleApplication/DashboardCircleApplicationDetailPage'
import DashboardCircleApplicationEditLinksPage from '../DashboardCircleApplication/DashboardCircleApplicationEditLinksPage'
import DashboardCircleApplicationEditOverviewPage from '../DashboardCircleApplication/DashboardCircleApplicationEditOverviewPage'
import DashboardCircleApplicationListPage from '../DashboardCircleApplication/DashboardCircleApplicationListPage'
import DashboardCircleApplicationUpdateCutPage from '../DashboardCircleApplication/DashboardCircleApplicationUpdateCutPage'
import DashboardContactPage from '../DashboardContact/DashboardContactPage'
import DashboardEventCreatePage from '../DashboardEventManage/EventCreate/DashboardEventCreatePage'
import DashboardEventInfoPage from '../DashboardEventManage/EventInfo/DashboardEventInfoPage'
import DashboardEventSpacesPage from '../DashboardEventSpaces/DashboardEventSpacesPage'
import DashboardEventApplicationsPage from '../DashboardEvents/DashboardEventCircleApplicationsPage'
import DashboardEventListPage from '../DashboardEvents/DashboardEventListPage'
import DashboardInquiryDetailPage from '../DashboardInquiry/DashboardInquiryDetailPage'
import DashboardInquiryListPage from '../DashboardInquiry/DashboardInquiryListPage'
import DashboardLicensePage from '../DashboardLicense/DashboardLicensePage'
import DashboardPaymentListPage from '../DashboardPayments/DashboardPaymentListPage'
import DashboardSearchPage from '../DashboardSearch/DashboardSearchPage'
import DashboardSettingsPage from '../DashboardSettings/DashboardSettingsPage'
import DashboardStoreCreatePage from '../DashboardStoreManage/StoreCreate/DashboardStoreCreatePage'
import DashboardStoreInfoPage from '../DashboardStoreManage/StoreInfo/DashboardStoreInfoPage'
import DashboardStoreDetailPage from '../DashboardStores/DashboardStoreDetailPage'
import DashboardStoreListPage from '../DashboardStores/DashboardStoreListPage'
import DashboardTicketCreatePage from '../DashboardStores/DashboardStoreTicketCreatePage'
import DashboardMyTicketDetailPage from '../DashboardTickets/DashboardMyTicketDetailPage'
import DashboardMyTicketListPage from '../DashboardTickets/DashboardMyTicketListPage'
import DashboardTicketDetailPage from '../DashboardTickets/DashboardTicketDetailPage'
import DashboardTicketListPage from '../DashboardTickets/DashboardTicketListPage'
import DashboardTicketTerminalPage from '../DashboardTickets/DashboardTicketTerminalPage'
import DashboardTopPage from '../DashboardTop/DashboardTopPage'
import IndexPage from '../Index/IndexPage'
import PasswordResetPage from '../PasswordReset/PasswordResetPage'
import PrivacyPolicyPage from '../Static/PrivacyPolicyPage'
import TermsOfServicePage from '../Static/TermsOfServicePage'
import TicketApplicationPage from '../TicketApplication/TicketApplicationPage'
import TicketAssignPage from '../TicketAssign/TicketAssignPage'
import TicketViewPage from '../TicketView/TicketViewPage'
import NotFoundPage from './NotFoundPage'
import '../../main.css'

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
                path: 'create',
                element: <DashboardEventCreatePage />
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
                  },
                  {
                    path: 'info',
                    element: <DashboardEventInfoPage />
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
                path: 'create',
                element: <DashboardStoreCreatePage />
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
                  },
                  {
                    path: 'info',
                    element: <DashboardStoreInfoPage />
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
