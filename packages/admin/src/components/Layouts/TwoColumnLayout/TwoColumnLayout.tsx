import styled from 'styled-components'

interface Props {
  children: React.ReactElement[]
}
const TwoColumnsLayout: React.FC<Props> = (props) => {
  return (
    <StyledColumnContainer>
      {props.children.map((c, k) => <StyledColumnItem key={k}>{c}</StyledColumnItem>)}
    </StyledColumnContainer>
  )
}

export default TwoColumnsLayout

const StyledColumnContainer = styled.section`
  margin-bottom: 20px;

  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  &:last-child {
    margin-bottom: 0;
  }

  @media screen and (max-width: 840px) {
    display: block;
    & > * {
      margin-bottom: 10px;
    }
  }
`
const StyledColumnItem = styled.section``
