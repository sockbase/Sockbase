import styled from 'styled-components'
import type { valueOf } from 'sockbase'

const AlertType = {
  Danger: 'danger',
  Success: 'success'
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
  margin-bottom: 20px;
  padding: 10px;
  background-color: var(--background-light-color);
  color: var(--text-color);
  border-radius: 5px;
  border-left: 8px solid var(--primary-brand-color);
  &:last-child {
    margin-bottom: 0;
  }

${props => {
    if (props.type === 'success') {
      return {
        borderLeft: '8px solid var(--success-color)'
      }
    } else if (props.type === 'danger') {
      return {
        borderLeft: '8px solid var(--danger-color)'
      }
    }
  }}
`
const AlertTitle = styled.div`
  font-weight: bold;
`
const AlertContent = styled.div``

export default Alert
