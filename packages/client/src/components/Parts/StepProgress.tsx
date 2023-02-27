import React from 'react'
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
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
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
      background-color: #808080;
      border-radius: 50%;
    }
    &::after {
      position: absolute;
      left: 7px;
      counter-increment: listItemCount 1;
      content: counter(listItemCount);
      color: #ffffff;
      text-align: center;
    }

    &.active {
      font-weight: bold;
      &::before {
        background-color: var(--darkAccentColor);
      }
    }
  }
`
