import styled from 'styled-components'

interface Props {
  steps: Array<{
    text: string
    isActive: boolean
  }>
}

const StepProgress: React.FC<Props> = props => {
  return (
    <Container>
      {props.steps.map((i, k) => (
        <li
          className={i.isActive ? 'active' : ''}
          key={k}>{i.text}
        </li>
      ))}
    </Container>
  )
}

export default StepProgress

const Container = styled.ol`
  margin-bottom: 20px;
  padding: 20px 0;
  border-bottom: 2px solid var(--border-color);
  display: flex;
  list-style: none;
  
  counter-reset: listItemCount 0;

  li {
    width: 100%;
    position: relative;
    padding-left: 32px;

    &::before {
      position: absolute;
      left: 0;
      top: calc(50% - 12px);
      content: '';
      display: inline-block;
      width: 24px;
      height: 24px;
      border: 1px solid var(--border-color);
      border-radius: 50%;
      background-color: var(--inputfield-background-color);

      transition: background-color 100ms linear,
                  color 100ms linear,
                  font-weight 100ms linear;
    }
    &::after {
      position: absolute;
      top: 0;
      left: 8px;
      counter-increment: listItemCount 1;
      content: counter(listItemCount);
      color: var(--text-color);
      text-align: center;
    }

    &.active {
      font-weight: bold;
      &::before {
        background-color: var(--primary-color);
        border: 1px solid var(--primary-color);
      }
      
      &::after {
        color: var(--white-color);
      }
    }
  }
`
