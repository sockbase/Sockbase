import styled from 'styled-components'

const FormInput = styled.input<{ hasError?: boolean }>`
  display: block;
  width: 100%;
  min-height: 2.5em;
  padding: 5px 10px;
  border-radius: 5px;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  background-color: var(--inputfield-background-color);
  
  transition: border 0.1s linear;
  
  &:focus {
    border: 1px solid var(--primary-color);
    outline: none;
    box-shadow: none;
  }

  &:not(:last-child) {
    border-radius: 5px 5px 0 0;
  }

  ${props => props.hasError && {
    border: '1px solid #ff2222 !important',
    boxShadow: '0 2px 5px #ff222288 !important'
  }}

  &:disabled {
    background-color: var(--disabled-background-color);
    color: var(--disabled-text-color);
  }
`

export default FormInput
