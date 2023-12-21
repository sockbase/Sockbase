import styled from 'styled-components'
import { Link } from 'react-router-dom'
import buttonMixin from '../Mixins/buttonMixin'

const LinkButton = styled(Link)<{ disabled?: boolean, inlined?: boolean, color?: 'danger' | 'info' }>`
  ${buttonMixin}
  text-decoration: none;
`

export default LinkButton
