import { createBrowserRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import CircleViewPage from './pages/CircleViewPage/CircleViewPage'
import EventCreatePassPage from './pages/EventCreatePassPage/EventCreatePassPage'
import EventDownloadCircleCutPage from './pages/EventDownloadCircleCutPage/EventDownloadCircleCutPage'
import EventExportSoleilPage from './pages/EventExportSoleilTSVPage/EventExportSoleilTSVPage'
import EventListPage from './pages/EventListPage/EventListPage'
import EventManageSpacePage from './pages/EventManageSpacePage/EventManageSpacePage'
import EventSendMailPage from './pages/EventSendMailPage/EventSendMailPage'
import EventViewPage from './pages/EventViewPage/EventViewPage'
import IndexPage from './pages/IndexPage/IndexPage'
import InformationCreatePage from './pages/InformationCreatePage/InformationCreatePage'
import InformationListPage from './pages/InformationListPage/InformationListPage'
import InformationViewPage from './pages/InformationViewPage/InformationViewPage'
import InquiryListPage from './pages/InquiryListPage/InquiryListPage'
import InquiryViewPage from './pages/InquiryViewPage/InquiryViewPage'
import LicensePage from './pages/LicenseViewPage/LicenseViewPage'
import LoginPage from './pages/LoginPage/LoginPage'
import StoreListPage from './pages/StoreListPage/StoreListPage'
import StoreViewPage from './pages/StoreViewPage/StoreViewPage'
import TicketTerminalPage from './pages/TicketTerminalPage/TicketTerminalPage'
import TicketViewPage from './pages/TicketViewPage/TicketViewPage'

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
            path: ':hashId',
            element: <TicketViewPage />
          },
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
            children: [
              {
                index: true,
                element: <EventViewPage />
              },
              {
                path: 'send-mails',
                element: <EventSendMailPage />
              },
              {
                path: 'export-soleil',
                element: <EventExportSoleilPage />
              },
              {
                path: 'create-passes',
                element: <EventCreatePassPage />
              },
              {
                path: 'download-circlecuts',
                element: <EventDownloadCircleCutPage />
              },
              {
                path: 'manage-spaces',
                element: <EventManageSpacePage />
              }
            ]
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
        children: [
          {
            index: true,
            element: <InformationListPage />
          },
          {
            path: 'create',
            element: <InformationCreatePage />
          },
          {
            path: ':informationId',
            element: <InformationViewPage />
          }
        ]
      },
      {
        path: 'inquiries',
        children: [
          {
            index: true,
            element: <InquiryListPage />
          },
          {
            path: ':inquiryId',
            element: <InquiryViewPage />
          }
        ]
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
