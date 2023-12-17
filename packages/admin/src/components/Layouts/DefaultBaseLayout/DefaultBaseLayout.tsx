import { useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import styled from 'styled-components'
import Sidebar from './Sidebar'
import LogotypeSVG from '../../../assets/logotype.svg'

interface Props {
  children: React.ReactNode
  title?: string
}

const DefaultBaseLayout: React.FC<Props> = (props) => {
  const pageTitle = useMemo(
    () => (props.title ? `${props.title} - Sockbase ADMIN` : 'Sockbase ADMIN'),
    [props.title]
  )

  return (
    <Container>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>
      <SidebarContainer>
        <SidebarBrand>
          <Logotype src={LogotypeSVG} alt="Sockbase ADMIN" />
        </SidebarBrand>
        <SidebarWrapper>
          <Sidebar />
        </SidebarWrapper>
      </SidebarContainer>
      <MainContainer>{props.children}</MainContainer>
    </Container>
  )
}

export default DefaultBaseLayout

const Container = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: 35% 1fr;
  justify-content: stretch;
  background-color: var(--primary-darkgray-color);
  user-select: none;
`

const SidebarContainer = styled.section`
  display: grid;
  grid-template-rows: auto 1fr;
  overflow-y: auto;
  border-right: 1px solid var(--border-color);
`
const SidebarBrand = styled.section`
  padding: 20px;
  text-align: center;
  background-color: #202020;
  font-size: 0;
  border-bottom: 1px solid var(--border-color);
`
const Logotype = styled.img`
  height: 32px;
`

const SidebarWrapper = styled.nav`
  padding: 40px;
`
const MainContainer = styled.main`
  height: 100%;
  overflow-y: auto;
`
