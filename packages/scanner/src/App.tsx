import { useState } from 'react'
import { PiGear, PiGearFill, PiQrCode, PiQrCodeFill } from 'react-icons/pi'
import styled from 'styled-components'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import useRouter from './hooks/useRouter'
import { getFirebaseApp } from './libs/FirebaseApp'
import Routes from './pages/Routes'

const menuItems = [
  {
    to: '/',
    ActiveIcon: PiQrCodeFill,
    Icon: PiQrCode
  },
  {
    to: '/settings',
    ActiveIcon: PiGearFill,
    Icon: PiGear
  }
]

getFirebaseApp()

const App: React.FC = () => {
  const [title, setTitle] = useState('')
  const { path, navigate } = useRouter()

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <ContainerWrap>
          <Container>
            <Routes
              path={path}
              setTitle={setTitle} />
          </Container>
          <Navbar>
            {menuItems.map((item, index) => (
              <LinkItem
                key={index}
                onClick={() => navigate(item.to)}>
                <LinkItemIcon>
                  {path === item.to ? <item.ActiveIcon /> : <item.Icon />}
                </LinkItemIcon>
              </LinkItem>
            ))}
          </Navbar>
        </ContainerWrap>
      </HelmetProvider>
    </>
  )
}

export default App

const ContainerWrap = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: 1fr auto;
`
const Container = styled.div`
  height: 100%;
  overflow-y: auto;
`
const Navbar = styled.div`
  padding-bottom: calc(env(safe-area-inset-bottom));
  display: flex;
  background-color: (--body-background-color);
`
const LinkItem = styled.div`
  padding: 1em;
  flex: 1;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  color: var(--text-color);
`
const LinkItemIcon = styled.div`
  width: 32px;
  height: 32px;
  svg {
    width: 32px;
    height: 32px;
  }
`
