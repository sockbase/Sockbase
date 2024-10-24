import { createBrowserRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import EventListPage from './pages/EventListPage/EventListPage'
import IndexPage from './pages/IndexPage/IndexPage'
import InformationListPage from './pages/InformationListPage/InformationListPage'
import InquiryListPage from './pages/InquiryListPage/InquiryListPage'
import LicensePage from './pages/LicensePage/LicensePage'
import StoreListPage from './pages/StoreListPage/StoreListPage'
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
        path: 'license',
        element: <LicensePage />
      },
      {
        path: 'stores',
        element: <StoreListPage />
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
        element: <EventListPage />
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
