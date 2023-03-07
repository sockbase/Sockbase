import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { buttonStyle, type ColorTypes } from '../mixins/button'

const LinkButton = styled(Link) <{ color?: ColorTypes }>`
  display: inline-block;
  width: 100%;
  ${buttonStyle}
  text-align: center;
  text-decoration: none !important;
`

export default LinkButton
