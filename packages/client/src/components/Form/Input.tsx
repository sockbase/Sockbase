import styled from 'styled-components'

const FormInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 10px;
  border: 2px solid #a0a0a0;
  border-radius: 5px 5px 0 0;
  
  transition: border 0.1s linear;
  
  &:focus {
    border: 2px solid #ea6183;
    outline: none;
    box-shadow: none;
  }

  &:last-child {
  border-radius: 5px;
  }

  ${props => props.hasError && {
    border: '2px solid #ff2222',
    boxShadow: '0 2px 5px #ff222288'
  }}
`

export default FormInput
