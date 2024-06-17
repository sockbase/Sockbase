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
import GlobalStyle from '../../styles/GlobalStyle'
import ResetStyle from '../../styles/ResetStyle'
import '../../main.css'
import CircleApplyPage from '../ApplyForm/CircleApplyPage/CircleApplyPage'
import TicketApplyPage from '../ApplyForm/TicketApplyPage/TicketApplyPage'
import TicketAssignPage from '../ApplyForm/TicketAssignPage/TicketAssignPage'
import TicketViewPage from '../ApplyForm/TicketViewPage/TicketViewPage'
import DashboardCircleApplicationDetailPage from '../Dashboard/DashboardCircleApplicationDetailPage/DashboardCircleApplicationDetailPage'
import DashboardCircleApplicationEditLinksPage from '../Dashboard/DashboardCircleApplicationEditLinksPage/DashboardCircleApplicationEditLinksPage'
import DashboardCircleApplicationEditOverviewPage from '../Dashboard/DashboardCircleApplicationEditOverviewPage/DashboardCircleApplicationEditOverviewPage'
import DashboardCircleApplicationListPage from '../Dashboard/DashboardCircleApplicationListPage/DashboardCircleApplicationListPage'
import DashboardCircleApplicationUpdateCutPage from '../Dashboard/DashboardCircleApplicationUpdateCutPage/DashboardCircleApplicationUpdateCutPage'
import DashboardContactPage from '../Dashboard/DashboardContactPage/DashboardContactPage'
import DashboardEventApplicationListPage from '../Dashboard/DashboardEventApplicationListPage/DashboardEventApplicationListPage'
import DashboardEventApplicationPrintTanzakuPage from '../Dashboard/DashboardEventApplicationPrintTanzakuPage/DashboardEventApplicationPrintTanzakuPage'
import DashboardEventCircleCutDownloadPage from '../Dashboard/DashboardEventCircleCutDownloadPage/DashboardEventCircleCutDownloadPage'
import DashboardEventCreatePage from '../Dashboard/DashboardEventCreatePage/DashboardEventCreatePage'
import DashboardEventListPage from '../Dashboard/DashboardEventListPage/DashboardEventListPage'
import DashboardEventMailSendPage from '../Dashboard/DashboardEventMailSendPage/DashboardEventMailSendPage'
import DashboardEventMetaViewPage from '../Dashboard/DashboardEventMetaViewPage/DashboardEventMetaViewPage'
import DashboardEventPassCreatePage from '../Dashboard/DashboardEventPassCreatePage/DashboardEventPassCreatePage'
import DashboardEventSpaceManagePage from '../Dashboard/DashboardEventSpaceManagePage/DashboardEventSpaceManagePage'
import DashboardInquiryDetailPage from '../Dashboard/DashboardInquiryDetailPage/DashboardInquiryDetailPage'
import DashboardInquiryListPage from '../Dashboard/DashboardInquiryListPage/DashboardInquiryListPage'
import DashboardLicenseViewPage from '../Dashboard/DashboardLicenseViewPage/DashboardLicenseViewPage'
import DashboardMyTicketDetailPage from '../Dashboard/DashboardMyTicketDetailPage/DashboardMyTicketDetailPage'
import DashboardMyTicketListPage from '../Dashboard/DashboardMyTicketListPage/DashboardMyTicketListPage'
import DashboardPaymentListPage from '../Dashboard/DashboardPaymentListPage/DashboardPaymentListPage'
import DashboardSearchPage from '../Dashboard/DashboardSearchPage/DashboardSearchPage'
import DashboardSettingPage from '../Dashboard/DashboardSettingPage/DashboardSettingPage'
import DashboardStoreCreatePage from '../Dashboard/DashboardStoreCreatePage/DashboardStoreCreatePage'
import DashboardStoreDetailPage from '../Dashboard/DashboardStoreDetailPage/DashboardStoreDetailPage'
import DashboardStoreListPage from '../Dashboard/DashboardStoreListPage/DashboardStoreListPage'
import DashboardStoreMetaViewPage from '../Dashboard/DashboardStoreMetaViewPage/DashboardStoreMetaViewPage'
import DashboardStoreTicketCreatePage from '../Dashboard/DashboardStoreTicketCreatePage/DashboardStoreTicketCreatePage'
import DashboardStreamTerminalPage from '../Dashboard/DashboardStreamTerminalPage/DashboardStreamTerminalPage'
import DashboardTicketDetailPage from '../Dashboard/DashboardTicketDetailPage/DashboardTicketDetailPage'
import DashboardTicketListPage from '../Dashboard/DashboardTicketListPage/DashboardTicketListPage'
import DashboardTicketTerminalPage from '../Dashboard/DashboardTicketTerminalPage/DashboardTicketTerminalPage'
import DashboardTopPage from '../Dashboard/DashboardTopPage/DashboardTopPage'
import IndexPage from '../IndexPage/IndexPage'
import NewTicketApplyPage from '../NewApplyForm/TicketApplyPage/TicketApplyPage'
import NewTicketAssignPage from '../NewApplyForm/TicketAssignPage/TicketAssignPage'
import PasswordResetPage from '../PasswordResetPage/PasswordResetPage'
import PrivacyPolicyPage from '../Static/PrivacyPolicyPage'
import TermsOfServicePage from '../Static/TermsOfServicePage'
import NotFoundPage from './NotFoundPage'

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
            element: <CircleApplyPage />
          }
        ]
      },
      {
        path: 'stores',
        children: [
          {
            path: ':storeId',
            children: [
              {
                index: true,
                element: <TicketApplyPage />
              },
              {
                path: 'new',
                element: <NewTicketApplyPage />
              }
            ]
          }
        ]
      },
      {
        path: 'assign-tickets',
        children: [
          {
            index: true,
            element: <TicketAssignPage />
          },
          {
            path: 'new',
            element: <NewTicketAssignPage />
          }
        ]
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
                element: <DashboardSettingPage />
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
                    element: <DashboardEventApplicationListPage />
                  },
                  {
                    path: 'spaces',
                    element: <DashboardEventSpaceManagePage />
                  },
                  {
                    path: 'info',
                    element: <DashboardEventMetaViewPage />
                  },
                  {
                    path: 'tanzaku',
                    element: <DashboardEventApplicationPrintTanzakuPage />
                  },
                  {
                    path: 'cuts',
                    element: <DashboardEventCircleCutDownloadPage />
                  },
                  {
                    path: 'send-mails',
                    element: <DashboardEventMailSendPage />
                  },
                  {
                    path: 'create-passes',
                    element: <DashboardEventPassCreatePage />
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
                    element: <DashboardStoreTicketCreatePage />
                  },
                  {
                    path: 'info',
                    element: <DashboardStoreMetaViewPage />
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
            element: <DashboardLicenseViewPage />
          },
          {
            path: 'search',
            element: <DashboardSearchPage />
          },
          {
            path: 'stream',
            element: <DashboardStreamTerminalPage />
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
      <GlobalStyle />
      <RouterProvider router={router} />
    </HelmetProvider>
  )
}

export default App
