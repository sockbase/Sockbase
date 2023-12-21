import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration
} from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { RecoilRoot } from 'recoil'

import ModalProvider from '../../components/Providers/ModalProvider/ModalProvider'
import NotificationProvider from '../../components/Providers/NotificationProvider/NotificationProvider'
import RequiredLogin from '../../libs/RequiredLogin'

import IndexPage from '../Index/IndexPage'
import LoginPage from '../Login/LoginPage'
import TicketTerminalPage from '../TicketTerminal/TicketTerminalPage'
import LicensePage from '../License/LicensePage'
import InquiryListPage from '../InquiryList/InquiryListPage'
import EventListPage from '../EventList/EventListPage'
import EventApplicationListPage from '../EventApplicationList/EventApplicationListPage'
import ApplicationDetailPage from '../ApplicationDetail/ApplicationDetailPage'
import StoreListPage from '../StoreList/StoreListPage'

const Root: React.FC = () => {
  return (
    <RecoilRoot>
      <HelmetProvider>
        <NotificationProvider />
        <ModalProvider />
        <RequiredLogin />
        <Outlet />
        <ScrollRestoration />
      </HelmetProvider>
    </RecoilRoot>
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
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'terminal',
        element: <TicketTerminalPage />
      },
      {
        path: 'license',
        element: <LicensePage />
      },
      {
        path: 'inquiries',
        element: <InquiryListPage />
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
            element: <EventApplicationListPage />
          }
        ]
      },
      {
        path: 'applications',
        children: [
          {
            path: ':appHashId',
            element: <ApplicationDetailPage />
          }
        ]
      },
      {
        path: 'stores',
        element: <StoreListPage />
      }
    ]
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
