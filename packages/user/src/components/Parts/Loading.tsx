import { MdRefresh } from 'react-icons/md'
import styled from 'styled-components'
import Blink from '../Keyframes/Blink'

interface Props {
  text?: string
}
const Loading: React.FC<Props> = (props) => {
  return (
    <Container>
      <Icon><MdRefresh /></Icon>
      <Title>読み込み中…</Title>
      {props.text && <Description>{props.text}を読み込んでいます。</Description>}
    </Container>
  )
}

const Container = styled.div`
  display: grid;
  grid-template-rows: auto auto;
  grid-template-columns: 64px 1fr;
  
  color: var(--text-color);

  padding: 10px;
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
  border-radius: 5px;
  
  animation: ${Blink} 0.5s ease-in-out alternate infinite;
`
const Icon = styled.div`
  grid-row: 1 / 3;
  padding: 10px;
  padding-left: 0;
  font-size: 48px;

  display: flex;
  justify-content: center;
  align-items: center;
`
const Title = styled.div`
  font-size: 1.5em;
  font-weight: bold;
`
const Description = styled.div`
`

export default Loading
