import styled from 'styled-components'
import Sidebar from './Sidebar'

interface Props {
  children: React.ReactNode
}
const DefaultLayout: React.FC<Props> = (props) => {
  return (
    <Container>
      <SidebarWrap>
        <Sidebar />
      </SidebarWrap>
      <MainWrap>
        {props.children}
      </MainWrap>
    </Container>
  )
}

export default DefaultLayout

const Container = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  @media screen and (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
const SidebarWrap = styled.div``
const MainWrap = styled.div`
  padding: 20px;
`
