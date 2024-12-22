import { PiArrowLeft } from 'react-icons/pi'
import styled from 'styled-components'
import useRouter from '../../hooks/useRouter'

interface Props {
  children: React.ReactNode
}

const PageTitle: React.FC<Props> = props => {
  const router = useRouter()

  return (
    <Container>
      <Backward onClick={() => router.navigate('/')}>
        <PiArrowLeft />
      </Backward>
      <Title>{props.children}</Title>
    </Container>
  )
}

const Container = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  border-bottom: 1px solid #c0c0c0;
  padding: 10px;
  gap: 10px;
`
const Backward = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 1.25em;
    height: 1.25em;
  }
`
const Title = styled.div`
  font-weight: bold;
`

export default PageTitle
