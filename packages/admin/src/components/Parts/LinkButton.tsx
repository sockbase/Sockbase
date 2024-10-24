import { Link } from 'react-router-dom'
import styled from 'styled-components'
import buttonStyle from '../Mixins/buttonStyle'

const FormButton = styled(Link)`
  ${buttonStyle}
  display: inline-block;
  text-decoration: none;
  color: inherit;
`

export default FormButton
