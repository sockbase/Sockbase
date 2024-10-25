import styled from 'styled-components'

const FormInput = styled.input`
  margin-bottom: 5px;
  &:last-child {
    margin-bottom: 0;
  }
  
  display: block;
  padding: 5px;
  width: 100%;
  border-radius: 5px;
  font: inherit;
  font-size: 16px;
  background-color: var(--background-color);
  color: var(--text-color);

  border: 1px solid var(--border-color);
  transition: border 0.1s linear;
  &:focus {
    outline: none;
    border: 1px solid var(--text-color);
  }

  &:disabled {
    background-color: var(--background-disabled-color);
    color: var(--text-disabled-color);
  }
`

export default FormInput
