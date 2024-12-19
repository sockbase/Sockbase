import styled from 'styled-components'

interface Props {
  children: React.ReactNode[]
}
const TwoColumnLayout: React.FC<Props> = props => {
  return (
    <Container>
      {props.children.map((c, i) => (
        <div key={i}>{c}</div>
      ))}
    </Container>
  )
}

export default TwoColumnLayout

const Container = styled.div`
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }

  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media screen and (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
