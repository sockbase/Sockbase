import { keyframes } from 'styled-components'

const blink = keyframes`
  0% {
    background-color: var(--background-light-color);
  }
  100% {
    background-color: var(--background-light2-color);
  }
`

export default blink
