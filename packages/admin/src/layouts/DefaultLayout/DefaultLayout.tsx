import styled from 'styled-components'
import Root from '../Root'
import Sidebar from './Sidebar'

interface Props {
  title: string
  children: React.ReactNode
}
const DefaultLayout: React.FC<Props> = (props) => {
  return (
    <Root title={props.title}>
      <Container>
        <SidebarWrap>
          <Sidebar />
        </SidebarWrap>
        <MainWrap>
          {props.children}
        </MainWrap>
      </Container>
    </Root>
  )
}

export default DefaultLayout

const Container = styled.div`
  height: 100%;
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
