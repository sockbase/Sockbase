import { keyframes } from 'styled-components'

const Blink = keyframes`
  0% {
    background-color: var(--primary-blink-keyframe-1);
  }
  100% {
    background-color: var(--primary-blink-keyframe-2);
  }
`

export default Blink
