import React from 'react'

import DefaultLayout from '../components/Layout/Default/Default'
import AppComponent from '../components/pages/App/App'

const App: React.FC = () => {
  return (
    <DefaultLayout title="hello world!">
      <AppComponent />
    </DefaultLayout>)
}

export default App
