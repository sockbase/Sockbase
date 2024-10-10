import styled from 'styled-components'
import { buttonStyle, type ColorTypes } from '../Mixins/Button'

const AnchorButton = styled.a<{ color?: ColorTypes, inlined?: boolean }>`
  display: inline-block;
  width: 100%;
  ${buttonStyle}

  ${props => props.inlined && `
    width: auto;
    padding: 10px 40px;
  `}
  text-align: center;
  text-decoration: none !important;
`

export default AnchorButton
