import styled from 'styled-components'

interface Props {
  isLoading: boolean
  children: React.ReactNode
}
const LoadingCircleWrapper: React.FC<Props> = (props) => {
  return (
    <Container>
      {props.children}
      {props.isLoading && <LoadingContainer>
        <LoadingCircleArea>
          <LoadingCircle />
        </LoadingCircleArea>
      </LoadingContainer>}
    </Container>
  )
}

export default LoadingCircleWrapper

const Container = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`

const LoadingContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;

  pointer-events: none;
  display: flex;
  flex-flow: row-reverse;

  padding-right: 10px;

  align-items: center;
`

const LoadingCircleArea = styled.section`
  font-size: 0;
`

const LoadingCircle = styled.span`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid #ffffffcc;
  border-right: 3px solid var(--darkAccentColor);
  border-radius: 50%;

  transform: rotate(-90deg);
  animation: spin 1s infinite linear;

  @keyframes spin {
    100% {
      transform: rotate(calc(360deg - 90deg));
    }
  }
`