import styled from 'styled-components'
import BlinkField from '../../components/Parts/BlinkField'

interface Props {
  icon: React.ReactNode
  title: string | undefined
  description: string
  isLoading?: boolean
}

const PageTitle: React.FC<Props> = props => {
  return (
    <Container>
      <Icon>{props.icon}</Icon>
      <Title>
        {!props.isLoading
          ? props.title
          : <BlinkField />}
      </Title>
      <Description>{props.description}</Description>
    </Container>
  )
}

const Container = styled.header`
  display: grid;
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);

  grid-template-columns: 64px 1fr;
  grid-template-rows: auto auto;
`
const Icon = styled.div`
  grid-row: 1 / 3;

  font-size: 3em;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-brand-color);
`
const Title = styled.div`
  grid-column: 2;
  font-size: 1.5em;
  font-weight: bold;
  color: var(--text-color);
`
const Description = styled.div`
  grid-column: 2;
  grid-row: 2;
  color: var(--text-light-color);
`

export default PageTitle
