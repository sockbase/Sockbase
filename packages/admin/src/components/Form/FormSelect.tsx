import styled from 'styled-components'

const FormSelect = styled.select`
  margin-bottom: 5px;
  &:last-child {
    margin-bottom: 0;
  }
  
  display: block;
  padding: 5px;
  width: 100%;
  border-radius: 5px;
  font: inherit;
  font-size: 1rem;
  border: 1px solid var(--border-color);
  background-color: var(--inputfield-background-color);
  color: var(--text-color);

  transition: border 0.1s linear;
  
  &:focus {
    outline: none;
    border: 1px solid var(--text-color);
  }
`

export default FormSelect
