import styled from 'styled-components'
import Blink from '../Keyframes/Blink'

const BlinkField = styled.div`
  display: inline-block;
  min-width: 128px;
  max-width: 25%;
  height: 1em;
  animation: ${Blink} 0.5s ease-in-out alternate infinite;
`

export default BlinkField
