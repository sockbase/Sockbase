import styled from 'styled-components'

import HeadHelper from '../../../libs/Helmet'
import LogotypeSVG from '../../../assets/logotype.svg'

import Sidebar from './Sidebar'

interface Props {
  children: React.ReactNode
  title: string
}
const DashboardLayout: React.FC<Props> = (props) => {
  return (
    <StyledLayout>
      <HeadHelper title={props.title} />
      <StyledHeader><Logotype src={LogotypeSVG} alt="Sockbase Logotype" /></StyledHeader>
      <StyledContainer>
        <StyledSidebar>
          <Sidebar />
        </StyledSidebar>
        <StyledMain>{props.children}</StyledMain>
      </StyledContainer>
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
`
const StyledSidebar = styled.nav`
  padding: 10px;
  background-color: #ffdede;
  overflow-y: auto;
`
const StyledMain = styled.main`
  padding: 20px;
  overflow-y: auto;
`

const Logotype = styled.img`
  height: 16px;
`
