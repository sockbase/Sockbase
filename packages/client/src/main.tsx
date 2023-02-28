import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

import './main.css'
import ResetStyle from './ResetStyle'
import GlobalStyle from './GlobalStyle'

import App from './containers/App'
import FormTemplate from './containers/FormTemplate'
import DashboardTemplate from './containers/DashboardTemplate'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <ResetStyle />
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />

          <Route path="/formTemplate" element={<FormTemplate />} />
          <Route path="/dashboardTemplate" element={<DashboardTemplate />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)
