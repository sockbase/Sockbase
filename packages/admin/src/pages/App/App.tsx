import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  ScrollRestoration,
} from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

import IndexPage from '../Index/IndexPage'
import LoginPage from '../Login/LoginPage'

const Root: React.FC = () => {
  return (
    <HelmetProvider>
      <Outlet />
      <ScrollRestoration />
    </HelmetProvider>
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
