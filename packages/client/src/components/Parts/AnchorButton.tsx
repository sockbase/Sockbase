import styled from 'styled-components'
import { buttonStyle, type ColorTypes } from '../Mixins/Button'

const AnchorButton = styled.a<{ color?: ColorTypes }>`
  display: inline-block;
  width: 100%;
  ${buttonStyle}
  text-align: center;
  text-decoration: none !important;
`

export default AnchorButton
