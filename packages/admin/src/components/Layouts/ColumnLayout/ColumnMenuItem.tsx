import styled from 'styled-components'

interface Props {
  title: string
  subTitle?: string
  onClick?: () => void
}
const ColumnMenuItem: React.FC<Props> = (props) => {
  return (
    <Container onClick={props.onClick}>
      <Title>{props.title}</Title>
      {props.subTitle && <SubTitle>{props.subTitle}</SubTitle>}
    </Container>
  )
}

export default ColumnMenuItem

const Container = styled.div`
  display: flex;
  flex-flow: column;

  padding: 5px;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  background-color: var(--brand-white-color);

  cursor: pointer;
  transition: 0.1s ease;

  &:not(:last-child) {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--border-color);
  }
`

const Title = styled.div``
const SubTitle = styled.div`
  font-size: 0.75em;
  color: var(--gray-color);
`
