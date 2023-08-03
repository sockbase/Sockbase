import { Link } from 'react-router-dom'
import styled from 'styled-components'

interface Props {
  to: string
  icon: React.ReactNode
  title: string
  description: string
  important?: boolean
}
const TopCard: React.FC<Props> = (props) => {
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
  color: inherit;
  &:hover {
    text-decoration: none;
  }
`
const CardHeader = styled.div<{ important: boolean | undefined }>`
  padding: 10px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 5px;
  background-color: ${props => props.important ? 'var(--primary-color)' : '#e0e0e0'};
  border-radius: 5px 5px 0 0;
`
const CardIcon = styled.div<{ important: boolean | undefined }>`
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    width: 24px;
    height: 24px;
  color: ${props => props.important ? '#ffffff' : '#000000'};
  }
`
const CardTitle = styled.div<{ important: boolean | undefined }>`
  font-weight: bold;
  color: ${props => props.important ? '#ffffff' : '#000000'};
`
const CardDescription = styled.div`
  padding: 10px;
  border-radius: 0 0 5px 5px;
  background-color: #f0f0f0;
  border-bottom: 2px solid #e0e0e0;
`
