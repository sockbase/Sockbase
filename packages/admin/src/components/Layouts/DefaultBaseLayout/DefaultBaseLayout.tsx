import { useCallback, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { type PrevPage } from '../../../@types'
import Sidebar from './Sidebar'
import LogotypeSVG from '../../../assets/logotype.svg'

interface Props {
  children: React.ReactNode
  title?: string
  prevPage?: PrevPage
}

const DefaultBaseLayout: React.FC<Props> = (props) => {
  const navigate = useNavigate()

  const pageTitle = useMemo(
    () => (props.title ? `${props.title} - Sockbase ADMIN` : 'Sockbase ADMIN'),
    [props.title]
  )

  const transitionPrevPage = useCallback(() => {
    if (!props.prevPage) return
    navigate(props.prevPage.path)
  }, [props.prevPage])

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
      <MainContainer>
        <BackButtonWrapper>
          {props.prevPage && <BackButtonContainer>
            <BackButton onClick={transitionPrevPage}>{props.prevPage.name}</BackButton>
          </BackButtonContainer>}
        </BackButtonWrapper>
        {props.children}
      </MainContainer>
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
  display: grid;
  grid-template-rows: auto 1fr;
`
const BackButtonWrapper = styled.div`
`
const BackButtonContainer = styled.div`
  border-bottom: 1px solid var(--border-color);
`
const BackButton = styled.span`
  display: inline-block;
  padding: 10px;
  padding-left: 32px;
  color: var(--primary-text-color);
  cursor: pointer;

  position: relative;

  &::before {
    position: absolute;
    top: calc(50% - 8px);
    left: 16px;
    display: inline-block;
    content: '';
    width: 12px;
    height: 12px;
    border-left: 2px solid var(--primary-text-color);
    border-bottom: 2px solid var(--primary-text-color);
    transform: rotate(45deg);
  }
`
