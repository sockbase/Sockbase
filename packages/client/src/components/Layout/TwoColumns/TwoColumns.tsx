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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`
const StyledColumnItem = styled.section``
