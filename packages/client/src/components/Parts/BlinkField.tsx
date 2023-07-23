import styled, { keyframes } from 'styled-components'

const blinkKeyframe = keyframes`
  0% {
    background-color: #ea618320;
  }
  100% {
    background-color: #ea618340;
  }
`

const BlinkField = styled.div`
  display: inline-block;
  min-width: 128px;
  max-width: 25%;
  height: 1em;
  animation: ${blinkKeyframe} 0.5s ease-in-out alternate infinite;
`

export default BlinkField
