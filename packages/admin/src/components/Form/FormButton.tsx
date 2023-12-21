import styled from 'styled-components'
import buttonMixin from '../Mixins/buttonMixin'

const FormButton = styled.button<{
  disabled?: boolean
  inlined?: boolean
  color?: 'danger' | 'info'
}>`
  ${buttonMixin}
`

export default FormButton
