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
} from './libs/FirebaseApp'
import ActionPage from './pages/ActionPage/ActionPage'
import CircleApplyPage from './pages/ApplyForm/CircleApplyPage/CircleApplyPage'
import TicketApplyPage from './pages/ApplyForm/TicketApplyPage/TicketApplyPage'
import TicketAssignPage from './pages/ApplyForm/TicketAssignPage/TicketAssignPage'
import DashboardCircleApplicationDetailPage from './pages/Dashboard/DashboardCircleApplicationDetailPage/DashboardCircleApplicationDetailPage'
import DashboardCircleApplicationEditLinksPage from './pages/Dashboard/DashboardCircleApplicationEditLinksPage/DashboardCircleApplicationEditLinksPage'
import DashboardCircleApplicationEditOverviewPage from './pages/Dashboard/DashboardCircleApplicationEditOverviewPage/DashboardCircleApplicationEditOverviewPage'
import DashboardCircleApplicationListPage from './pages/Dashboard/DashboardCircleApplicationListPage/DashboardCircleApplicationListPage'
import DashboardCircleApplicationUpdateCutPage from './pages/Dashboard/DashboardCircleApplicationUpdateCutPage/DashboardCircleApplicationUpdateCutPage'
import DashboardContactPage from './pages/Dashboard/DashboardContactPage/DashboardContactPage'
import DashboardMyTicketDetailPage from './pages/Dashboard/DashboardMyTicketDetailPage/DashboardMyTicketDetailPage'
import DashboardMyTicketListPage from './pages/Dashboard/DashboardMyTicketListPage/DashboardMyTicketListPage'
import DashboardPaymentListPage from './pages/Dashboard/DashboardPaymentListPage/DashboardPaymentListPage'
import DashboardSettingPage from './pages/Dashboard/DashboardSettingPage/DashboardSettingPage'
import DashboardTicketDetailPage from './pages/Dashboard/DashboardTicketDetailPage/DashboardTicketDetailPage'
import DashboardTicketListPage from './pages/Dashboard/DashboardTicketListPage/DashboardTicketListPage'
import DashboardTopPage from './pages/Dashboard/DashboardTopPage/DashboardTopPage'
import IndexPage from './pages/IndexPage/IndexPage'
import InformationDetailPage from './pages/InformationDetailPage/InformationDetailPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import PasswordResetPage from './pages/PasswordResetPage/PasswordResetPage'
import PrivacyPolicyPage from './pages/Static/PrivacyPolicyPage'
import TermsOfServicePage from './pages/Static/TermsOfServicePage'
import TicketViewPage from './pages/TicketViewPage/TicketViewPage'

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
        path: 'tickets',
        children: [
          {
            path: ':ticketHashId',
            element: <TicketViewPage />
          }
        ]
      },
      {
        path: 'assign-tickets',
        element: <TicketAssignPage />
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
            path: 'applications',
            children: [
              {
                index: true,
                element: <DashboardCircleApplicationListPage />
              },
              {
                path: ':hashId',
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
                path: ':hashId',
                element: <DashboardTicketDetailPage />
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
                path: ':hashId',
                element: <DashboardMyTicketDetailPage />
              }
            ]
          },
          {
            path: 'payments',
            element: <DashboardPaymentListPage />
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
      <RouterProvider router={router} />
    </HelmetProvider>
  )
}

export default App
