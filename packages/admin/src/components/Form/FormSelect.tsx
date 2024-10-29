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
  font-size: 16px;
  background-color: var(--background-color);
  color: var(--text-color);

`

export default FormSelect
