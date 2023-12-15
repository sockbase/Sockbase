import React from 'react'
import ReactDOM from 'react-dom/client'

import './styles/main.scss'
import Colors from './styles/Colors'
import GlobalStyle from './styles/GlobalStyle'

import App from './pages/App/App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Colors />
    <GlobalStyle />
    <App />
  </React.StrictMode>
)
