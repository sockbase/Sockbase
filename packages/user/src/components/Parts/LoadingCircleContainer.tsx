import styled from 'styled-components'

interface Props {
  children: React.ReactNode
}
const LoadingCircleContainer: React.FC<Props> = props => {
  return (
    <Container>
      <LoadingCircle />
      <Message>
        {props.children}
      </Message>
    </Container>
  )
}

export default LoadingCircleContainer

const Container = styled.div`
  margin-bottom: 20px;
  display: flex;
  padding: 20px;
  gap: 20px;
  justify-content: center;
  align-items: center;
  background-color: var(--panel-background-color);
  border-radius: 5px;

  &:last-child {
    margin-bottom: 0;
  }

  @media screen and (max-width: 840px) {
    flex-direction: column-reverse;
    gap: 10px;
  }
`
const LoadingCircle = styled.span`
  display: inline-block;
  min-width: 24px;
  min-height: 24px;
  width: 24px;
  height: 24px;
  border: 3px solid #ffffffcc;
  border-right: 3px solid var(--primary-color);
  border-radius: 50%;

  transform: rotate(-90deg);
  animation: spin 1s infinite linear;

  @keyframes spin {
    100% {
      transform: rotate(calc(360deg - 90deg));
    }
  }
`
const Message = styled.span``
