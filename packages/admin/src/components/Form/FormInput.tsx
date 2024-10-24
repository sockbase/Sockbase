import styled from 'styled-components'

const FormInput = styled.input`
  display: block;
  padding: 5px;
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  font: inherit;
  font-size: 16px;
  background-color: var(--background-color);
  color: var(--text-color);
  
  &:focus {
    outline: none;
  }

  &:disabled {
    background-color: var(--background-disabled-color);
    color: var(--text-disabled-color);
  }
`

export default FormInput
