import styled from 'styled-components'

interface Props {
  title?: string
  description?: string
}

const PageTitle: React.FC<Props> = (props) => {
  return (
    <StyledPageTitleContainer>
      <StyledIcon>icon</StyledIcon>
      <StyledTitle>{props.title}</StyledTitle>
      <StyledDescription>{props.description}</StyledDescription>
    </StyledPageTitleContainer>
  )
}

const StyledPageTitleContainer = styled.div`
  display: grid;
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 2px solid #c0c0c0;

  grid-template-columns: 64px 1fr;
  grid-template-rows: auto auto;
`
const StyledIcon = styled.div`
  grid-row: 1 / 2;
  & * {
    display: flex;
    justify-items: center;
    align-items: center;
  }
`
const StyledTitle = styled.div`
  grid-column: 2;
  font-size: 1.5em;
  font-weight: bold;
`
const StyledDescription = styled.div`
  grid-column: 2;
  grid-row: 2;
`

export default PageTitle
