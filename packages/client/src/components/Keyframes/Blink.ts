import { keyframes } from 'styled-components'

const Blink = keyframes`
  0% {
    background-color: var(--background-primary-brand-color);
  }
  100% {
    background-color: var(--background-primary-brand2-color);
  }
`

export default Blink
