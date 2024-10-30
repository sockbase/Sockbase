import styled from 'styled-components'
import Blink from '../Keyframes/Blink'

interface Props {
  percent: number
}
const ProgressBar: React.FC<Props> = (props) => {
  return (
    <Container>
      <Progress percent={props.percent}>{props.percent}%</Progress>
    </Container>
  )
}

export default ProgressBar

const Container = styled.div`
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
  
  background-color: var(--panel-background-color);
  border-radius: 5px;
`

const Progress = styled.div<{ percent: number }>`
  padding: 0 ${props => props.percent > 0 ? 5 : 0}px;
  width: ${props => props.percent}%;
  text-align: right;
  animation: ${Blink} 0.5s ease-in-out alternate infinite;
  transition: 1s ease;
  border-radius: 5px;
`
