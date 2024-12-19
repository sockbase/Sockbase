import styled from 'styled-components'

interface Props {
  icon: JSX.Element
  label: string
}
const IconLabel: React.FC<Props> = props => {
  return (
    <Container>
      <Icon>{props.icon}</Icon>
      <Label>{props.label}</Label>
    </Container>
  )
}

export default IconLabel

const Container = styled.div`
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
`
const Icon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 1.5em;
    height: 1.5em;
  }
`
const Label = styled.span``
