import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { buttonStyle, type ColorTypes } from '../Mixins/button'

const LinkButton = styled(Link) <{ color?: ColorTypes, inlined?: boolean }>`
  display: inline-block;
  ${buttonStyle}
  ${props => props.inlined && `
    width: auto;
    padding: 10px 40px;
  `}
  text-align: center;
  text-decoration: none !important;
`

export default LinkButton
