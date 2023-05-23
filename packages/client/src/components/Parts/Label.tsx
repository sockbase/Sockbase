import styled from 'styled-components'
import { type valueOf } from 'sockbase'

const ColorType = {
  Success: 'success'
} as const
type ColorTypes = valueOf<typeof ColorType>

const Label = styled.span<{ color?: ColorTypes }>`
  display: inline-block;
  padding: 0 2px;
  background-color: #c0c0c0;
  border-radius: 5px;

  ${props => props.color === ColorType.Success
    ? {
      backgroundColor: '#a0ffa0'
    }
    : {}}
`

export default Label
