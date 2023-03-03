import styled from 'styled-components'

type AlertType = 'success' | 'danger'

interface Props {
  type?: AlertType
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

const AlertContainer = styled.div<{ type?: AlertType }>`
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
  border-left: 8px solid #ea6183;
  &:last-child {
    margin-bottom: 0;
  }

${props => props.type === 'success'
    ? {
      borderLeft: '8px solid #44bf40'
    }
    : props.type === 'danger'
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
