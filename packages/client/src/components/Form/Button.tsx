import styled from 'styled-components'
import { buttonStyle, type ColorTypes } from '../mixins/button'

const FormButton = styled.button<{ color?: ColorTypes }>`
  ${buttonStyle}
`

export default FormButton
