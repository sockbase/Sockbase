import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration,
} from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { RecoilRoot } from 'recoil'

import IndexPage from '../Index/IndexPage'
import LoginPage from '../Login/LoginPage'
import ModalProvider from '../../components/Providers/ModalProvider/ModalProvider'
import NotificationProvider from '../../components/Providers/NotificationProvider/NotificationProvider'
import RequiredLogin from '../../libs/RequiredLogin'

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
        element: <IndexPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
])

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  )
}

export default App
