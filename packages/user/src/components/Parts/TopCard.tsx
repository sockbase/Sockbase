import { Link } from 'react-router-dom'
import styled from 'styled-components'

interface Props {
  to: string
  icon: React.ReactNode
  title: string
  description: string
  important?: boolean
}
const TopCard: React.FC<Props> = props => {
  return (
    <Card to={props.to}>
      <CardHeader important={props.important}>
        <CardIcon important={props.important}>{props.icon}</CardIcon>
        <CardTitle important={props.important}>{props.title}</CardTitle>
      </CardHeader>
      <CardDescription>{props.description}</CardDescription>
    </Card>
  )
}

export default TopCard

const Card = styled(Link)`
  display: grid;
  grid-template-rows: auto 1fr;
  text-decoration: none;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background-color: var(--panel-background-color);
`
const CardHeader = styled.div<{ important: boolean | undefined }>`
  padding: 10px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 5px;
  background-color: ${props => props.important ? 'var(--danger-color)' : 'var(--default-color)'};
  border-radius: 4px 4px 0 0;
`
const CardIcon = styled.div<{ important: boolean | undefined }>`
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 1.5em;
    height: 1.5em;
    color: ${props => props.important ? 'var(--white-color)' : 'var(--text-color)'};
  }
`
const CardTitle = styled.div<{ important: boolean | undefined }>`
  font-weight: bold;
  color: ${props => props.important ? 'var(--white-color)' : 'var(--text-color)'};
`
const CardDescription = styled.div`
  padding: 10px;
`
