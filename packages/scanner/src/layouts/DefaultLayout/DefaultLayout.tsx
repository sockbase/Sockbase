import styled from 'styled-components'

interface Props {
  children: React.ReactNode
}
const DefaultLayout: React.FC<Props> = props => {
  return (
    <Container>
      {props.children}
    </Container>
  )
}

export default DefaultLayout

const Container = styled.div`
`
