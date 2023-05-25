import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import useFirebase from '../../../hooks/useFirebase'

import HeadHelper from '../../../libs/Helmet'
import LogotypeSVG from '../../../assets/logotype.svg'

import Sidebar from './Sidebar'
import RequiredLogin from '../../../libs/RequiredLogin'

interface Props {
  children: React.ReactNode
  title: string
}
const DashboardLayout: React.FC<Props> = (props) => {
  const firebase = useFirebase()
  const navigate = useNavigate()

  const logout: () => void =
    () => {
      firebase.logout()
      navigate('/')
    }

  return (
    <StyledLayout>
      <RequiredLogin />
      {firebase.isLoggedIn && firebase.user && <>
        <HeadHelper title={props.title} />
        <StyledHeader><Logotype src={LogotypeSVG} alt="Sockbase Logotype" /></StyledHeader>
        <StyledContainer>
          <StyledSidebar>
            <Sidebar logout={logout} user={firebase.user} />
          </StyledSidebar>
          <StyledWrapMain>
            <StyledMain>{props.children}</StyledMain>
          </StyledWrapMain>
        </StyledContainer>
      </>}
    </StyledLayout>
  )
}

export default DashboardLayout

const StyledLayout = styled.section`
  display: grid;
  height: 100%;
  grid-template-rows: auto 1fr;
  overflow: hidden;
`
const StyledHeader = styled.header`
  padding: 10px;
  background-color: #ea6183;
`
const StyledContainer = styled.section`
  display: grid;
  height: 100%;
  overflow-y: hidden;
  grid-template-columns: 25% 1fr;

  @media screen and (max-width: 840px) {
    display: block;
    overflow-y: auto;
  }
`
const StyledSidebar = styled.nav`
  padding: 10px;
  background-color: #ffdede;
  overflow-y: auto;
`
const StyledWrapMain = styled.main`
  padding: 20px;
  overflow-y: auto;
  @media screen and (max-width: 840px) {
    padding: 0;
  }
`
const StyledMain = styled.div`
  min-height: 100%;
  padding: 20px;
  background-color: #ffffff;
`

const Logotype = styled.img`
  height: 16px;
`
