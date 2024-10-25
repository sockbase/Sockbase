import styled from 'styled-components'
import buttonStyle from '../Mixins/buttonStyle'

const AnchorButton = styled.a`
  ${buttonStyle}
  display: inline-block;
  text-decoration: none;
  color: inherit;
`

export default AnchorButton
