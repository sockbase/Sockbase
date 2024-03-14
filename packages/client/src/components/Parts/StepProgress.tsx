import styled from 'styled-components'

interface Props {
  steps: Array<{
    text: string
    isActive: boolean
  }>
}

const StepProgress: React.FC<Props> = (props) => {
  return (
    <StyledStepProgress>
      {props.steps.map((i, k) => <li key={k} className={i.isActive ? 'active' : ''}>{i.text}</li>)}
    </StyledStepProgress>
  )
}

export default StepProgress

const StyledStepProgress = styled.ol`
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
      content: '';
      display: inline-block;
      width: 24px;
      height: 24px;
      background-color: var(--background-dark-color);
      border-radius: 50%;

      transition: background-color 100ms linear,
                  color 100ms linear,
                  font-weight 100ms linear;
    }
    &::after {
      position: absolute;
      left: 7px;
      counter-increment: listItemCount 1;
      content: counter(listItemCount);
      color: var(--text-color);
      text-align: center;
    }

    &.active {
      font-weight: bold;
      &::before {
        background-color: var(--primary-brand-color);
      }
      
      &::after {
        color: var(--text-foreground-color);
      }
    }
  }
`
