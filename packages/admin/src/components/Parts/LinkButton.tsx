import { Link } from 'react-router-dom'
import styled from 'styled-components'
import buttonStyle from '../Mixins/buttonStyle'

const LinkButton = styled(Link)<{ disabled?: boolean }>`
  ${buttonStyle}
  display: inline-block;
  text-decoration: none;
  color: inherit;
`

export default LinkButton
