import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration
} from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import ActionPage from './pages/ActionPage/ActionPage'
import CircleApplyPage from './pages/ApplyForm/CircleApplyPage/CircleApplyPage'
import TicketApplyPage from './pages/ApplyForm/TicketApplyPage/TicketApplyPage'
import TicketAssignPage from './pages/ApplyForm/TicketAssignPage/TicketAssignPage'
import CheckoutProcessPage from './pages/CheckoutProcessPage/CheckoutProcessPage'
import HogePage from './pages/CheckoutProcessPage/HogePage'
import DashboardCircleEditLinksPage from './pages/Dashboard/DashboardCircleEditLinksPage/DashboardCircleEditLinksPage'
import DashboardCircleEditOverviewPage from './pages/Dashboard/DashboardCircleEditOverviewPage/DashboardCircleEditOverviewPage'
import DashboardCircleListPage from './pages/Dashboard/DashboardCircleListPage/DashboardCircleListPage'
import DashboardCircleUpdateCutPage from './pages/Dashboard/DashboardCircleUpdateCutPage/DashboardCircleUpdateCutPage'
import DashboardCircleViewLinksPage from './pages/Dashboard/DashboardCircleViewLinksPage/DashboardCircleViewLinksPage'
import DashboardCircleViewPage from './pages/Dashboard/DashboardCircleViewPage/DashboardCircleViewPage'
import DashboardContactPage from './pages/Dashboard/DashboardContactPage/DashboardContactPage'
import DashboardMyTicketListPage from './pages/Dashboard/DashboardMyTicketListPage/DashboardMyTicketListPage'
import DashboardMyTicketViewPage from './pages/Dashboard/DashboardMyTicketViewPage/DashboardMyTicketViewPage'
import DashboardPaymentListPage from './pages/Dashboard/DashboardPaymentListPage/DashboardPaymentListPage'
import DashboardSettingPage from './pages/Dashboard/DashboardSettingPage/DashboardSettingPage'
import DashboardTicketListPage from './pages/Dashboard/DashboardTicketListPage/DashboardTicketListPage'
import DashboardTicketViewPage from './pages/Dashboard/DashboardTicketViewPage/DashboardTicketViewPage'
import DashboardTopPage from './pages/Dashboard/DashboardTopPage/DashboardTopPage'
import IndexPage from './pages/IndexPage/IndexPage'
import InformationViewPage from './pages/InformationViewPage/InformationViewPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import PasswordResetPage from './pages/PasswordResetPage/PasswordResetPage'
import PrivacyPolicyPage from './pages/Static/PrivacyPolicyPage'
import TermsOfServicePage from './pages/Static/TermsOfServicePage'
import TicketViewPage from './pages/TicketViewPage/TicketViewPage'

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
            element: <InformationViewPage />
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
        path: 'hoge',
        element: <HogePage />
      },
      {
        path: 'checkout',
        element: <CheckoutProcessPage />
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
                element: <DashboardCircleListPage />
              },
              {
                path: ':hashId',
                children: [
                  {
                    index: true,
                    element: <DashboardCircleViewPage />
                  },
                  {
                    path: 'links',
                    element: <DashboardCircleEditLinksPage />
                  },
                  {
                    path: 'overview',
                    element: <DashboardCircleEditOverviewPage />
                  },
                  {
                    path: 'cut',
                    element: <DashboardCircleUpdateCutPage />
                  },
                  {
                    path: 'view-links',
                    element: <DashboardCircleViewLinksPage />
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
                element: <DashboardTicketViewPage />
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
                element: <DashboardMyTicketViewPage />
              }
            ]
          },
          {
            path: 'payments',
            children: [
              {
                index: true,
                element: <DashboardPaymentListPage />
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
      <RouterProvider router={router} />
    </HelmetProvider>
  )
}

export default App
