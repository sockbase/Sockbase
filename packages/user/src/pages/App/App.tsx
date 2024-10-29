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
import ActionPage from '../ActionPage/ActionPage'
import CircleApplyPage from '../ApplyForm/CircleApplyPage/CircleApplyPage'
import TicketApplyPage from '../ApplyForm/TicketApplyPage/TicketApplyPage'
import TicketAssignPage from '../ApplyForm/TicketAssignPage/TicketAssignPage'
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
import DashboardEventMetaViewPage from '../Dashboard/DashboardEventMetaViewPage/DashboardEventMetaViewPage'
import DashboardInformationCreatePage from '../Dashboard/DashboardInformationCreatePage/DashboardInformationCreatePage'
import DashboardInformationDetailPage from '../Dashboard/DashboardInformationDetailPage/DashboardInformationDetailPage'
import DashboardMyTicketDetailPage from '../Dashboard/DashboardMyTicketDetailPage/DashboardMyTicketDetailPage'
import DashboardMyTicketListPage from '../Dashboard/DashboardMyTicketListPage/DashboardMyTicketListPage'
import DashboardPaymentListPage from '../Dashboard/DashboardPaymentListPage/DashboardPaymentListPage'
import DashboardSettingPage from '../Dashboard/DashboardSettingPage/DashboardSettingPage'
import DashboardStoreCreatePage from '../Dashboard/DashboardStoreCreatePage/DashboardStoreCreatePage'
import DashboardStoreMetaViewPage from '../Dashboard/DashboardStoreMetaViewPage/DashboardStoreMetaViewPage'
import DashboardStoreTicketCreatePage from '../Dashboard/DashboardStoreTicketCreatePage/DashboardStoreTicketCreatePage'
import DashboardStoreTicketListPage from '../Dashboard/DashboardStoreTicketListPage/DashboardStoreTicketListPage'
import DashboardTicketDetailPage from '../Dashboard/DashboardTicketDetailPage/DashboardTicketDetailPage'
import DashboardTicketListPage from '../Dashboard/DashboardTicketListPage/DashboardTicketListPage'
import DashboardTicketTerminalPage from '../Dashboard/DashboardTicketTerminalPage/DashboardTicketTerminalPage'
import DashboardTopPage from '../Dashboard/DashboardTopPage/DashboardTopPage'
import IndexPage from '../IndexPage/IndexPage'
import InformationDetailPage from '../InformationDetailPage/InformationDetailPage'
import PasswordResetPage from '../PasswordResetPage/PasswordResetPage'
import PrivacyPolicyPage from '../Static/PrivacyPolicyPage'
import TermsOfServicePage from '../Static/TermsOfServicePage'
import TicketViewPage from '../TicketViewPage/TicketViewPage'
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
        path: 'informations',
        children: [
          {
            path: ':informationId',
            element: <InformationDetailPage />
          }
        ]
      },
      {
        path: 'reset-password',
        element: <PasswordResetPage />
      },
      {
        path: 'action',
        element: <ActionPage />
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
            element: <TicketApplyPage />
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
                path: 'create',
                element: <DashboardStoreCreatePage />
              },
              {
                path: ':storeId',
                children: [
                  {
                    index: true,
                    element: <DashboardStoreTicketListPage />
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
            path: 'informations',
            children: [
              {
                path: 'create',
                element: <DashboardInformationCreatePage />
              },
              {
                path: ':informationId',
                element: <DashboardInformationDetailPage />
              }
            ]
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
