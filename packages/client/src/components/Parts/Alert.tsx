import styled from 'styled-components'
import type { valueOf } from 'sockbase'

const AlertType = {
  Danger: 'danger'
} as const
type AlertTypes = valueOf<typeof AlertType>

interface Props {
  type?: AlertTypes
  title?: string
  children: React.ReactNode
}
const Alert: React.FC<Props> = (props) => {
  return (
    <AlertContainer type={props.type}>
      <AlertTitle>{props.title}</AlertTitle>
      <AlertContent>{props.children}</AlertContent>
    </AlertContainer>
  )
}

const AlertContainer = styled.div<{ type?: AlertTypes }>`
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  border-left: 8px solid #ea6183;
  &:last-child {
    margin-bottom: 0;
  }

${props => props.type === 'danger'
    ? {
      borderLeft: '8px solid #bf4040'
    }
    : {}}
`
const AlertTitle = styled.div`
  font-weight: bold;
`
const AlertContent = styled.div``

export default Alert
