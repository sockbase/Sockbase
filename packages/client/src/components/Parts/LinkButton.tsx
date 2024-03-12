import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { buttonStyle, type ColorTypes } from '../Mixins/Button'

const LinkButton = styled(Link) <{ color?: ColorTypes, inlined?: boolean, disabled?: boolean }>`
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
