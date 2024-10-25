import { createBrowserRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import CircleViewPage from './pages/CircleViewPage/CircleViewPage'
import EventListPage from './pages/EventListPage/EventListPage'
import EventViewPage from './pages/EventViewPage/EventViewPage'
import IndexPage from './pages/IndexPage/IndexPage'
import InformationListPage from './pages/InformationListPage/InformationListPage'
import InquiryListPage from './pages/InquiryListPage/InquiryListPage'
import LicensePage from './pages/LicenseViewPage/LicenseViewPage'
import LoginPage from './pages/LoginPage/LoginPage'
import StoreListPage from './pages/StoreListPage/StoreListPage'
import StoreViewPage from './pages/StoreViewPage/StoreViewPage'
import TicketTerminalPage from './pages/TicketTerminalPage/TicketTerminalPage'

const Root: React.FC = () => {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  )
}

const routes = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        index: true,
        element: <IndexPage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'license',
        element: <LicensePage />
      },
      {
        path: 'stores',
        children: [
          {
            index: true,
            element: <StoreListPage />
          },
          {
            path: ':storeId',
            element: <StoreViewPage />
          }
        ]
      },
      {
        path: 'tickets',
        children: [
          {
            path: 'terminal',
            element: <TicketTerminalPage />
          }
        ]
      },
      {
        path: 'events',
        children: [
          {
            index: true,
            element: <EventListPage />
          },
          {
            path: ':eventId',
            element: <EventViewPage />
          }
        ]
      },
      {
        path: 'circles',
        children: [
          {
            path: ':hashId',
            element: <CircleViewPage />
          }
        ]
      },
      {
        path: 'informations',
        element: <InformationListPage />
      },
      {
        path: 'inquiries',
        element: <InquiryListPage />
      }
    ]
  }
])

const App: React.FC = () => {
  return (
    <>
      <HelmetProvider>
        <RouterProvider router={routes} />
      </HelmetProvider>
    </>
  )
}

export default App
