import styled from 'styled-components'
import BlinkField from './BlinkField'

interface Props {
  icon: React.ReactNode
  title: string | undefined
  isLoading?: boolean
}

const PageTitle: React.FC<Props> = props => {
  return (
    <Container>
      <PageIcon>{props.icon}</PageIcon>
      <Title>
        {!props.isLoading
          ? props.title
          : <BlinkField />}
      </Title>
    </Container>
  )
}

const Container = styled.header`
  display: grid;
  padding-bottom: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
  grid-template-columns: 2em 1fr;
  grid-template-rows: auto auto;
  gap: 5px;
`
const PageIcon = styled.div`
  grid-row: 1 / 3;

  font-size: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-color);
`
const Title = styled.div`
  grid-column: 2;
  font-size: 1.25em;
  font-weight: bold;
  color: var(--text-color);
`
export default PageTitle
