import { useEffect, useMemo } from 'react'
import ScannerPage from './ScannerPage/ScannerPage'
import SettingsPage from './SettingsPage/SettingsPage'

const router = {
  '/': {
    title: 'ホーム',
    Element: ScannerPage
  },
  '/settings': {
    title: '設定',
    Element: SettingsPage
  }
}

interface Props {
  path: string
  setTitle: (title: string) => void
}
const Routes: React.FC<Props> = props => {
  const Page = useMemo(() => {
    return Object.entries(router).find(([key]) => key === props.path)?.[1]
  }, [router, props.path])

  useEffect(() => {
    if (!Page) return
    props.setTitle(`${Page.title} - Sockbase SCANNER`)
  }, [Page])

  return (
    <>
      {Page ? <Page.Element /> : <h1>404 Not Found</h1>}
    </>
  )
}

export default Routes
