import styled from 'styled-components'
import { type PrevPage } from '../../../@types'
import DefaultBaseLayout from '../DefaultBaseLayout/DefaultBaseLayout'

interface Props {
  prevPage?: PrevPage
  title: string
  items: React.ReactElement[]
  main: React.ReactElement
}
const ColumnLayout: React.FC<Props> = (props) => {
  return (
    <DefaultBaseLayout title={props.title} prevPage={props.prevPage}>
      <Container>
        <Menu>
          <MenuHeader>{props.title}</MenuHeader>
          {props.items.map((i) => i)}
        </Menu>
        <Main>{props.main}</Main>
      </Container>
    </DefaultBaseLayout>
  )
}

export default ColumnLayout

const Container = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: 45% 1fr;
`
const Menu = styled.div`
  overflow-y: auto;
  border-right: 1px solid var(--border-color);
`
const Main = styled.div`
  overflow-y: auto;
  padding: 10px;
`

const MenuHeader = styled.header`
  padding: 10px;
  font-weight: bold;
`
