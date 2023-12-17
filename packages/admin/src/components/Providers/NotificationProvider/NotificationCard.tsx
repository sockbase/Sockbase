import { useEffect, useState } from 'react'
import styled from 'styled-components'

const maxSeconds = 5

interface Props {
  message: string
  handleRemove: () => void
}
const NotificationCard: React.FC<Props> = (props) => {
  const [seconds, setSeconds] = useState(maxSeconds)
  const [cancelToken, setCancelToken] = useState<NodeJS.Timeout>()

  const onInitialize = (): () => void => {
    const cancelToken = setInterval(() => {
      setSeconds(s => s - 1)
    }, 1000)
    setCancelToken(cancelToken)

    return () => {
      clearInterval(cancelToken)
    }
  }
  useEffect(onInitialize, [])

  const onSeconds = (): void => {
    if (seconds > 0) return
    props.handleRemove()
    clearInterval(cancelToken)
  }
  useEffect(onSeconds, [seconds])

  return (
    <Container seconds={seconds}>
      {props.message}
    </Container>
  )
}

export default NotificationCard

const Container = styled.div<{ seconds: number }>`
  width: 25%;
  padding: 10px;
  background-color: var(--brand-black-color);
  color: var(--brand-white-color);
  border-radius: 5px;

  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: ${props => (props.seconds - 1) / (maxSeconds - 1) * 100}%;
    height: 5px;
    background-color: #ffffff80;
    border-radius: 0 0 5px 5px;
    transition: width 1s ease;
  }
`
