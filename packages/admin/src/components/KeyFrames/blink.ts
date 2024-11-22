import { keyframes } from 'styled-components'

const blink = keyframes`
  0% {
    background-color: var(--blink-keyframe-1);
  }
  100% {
    background-color: var(--blink-keyframe-2);
  }
`

export default blink
