import styled from 'styled-components'

const FormTextarea = styled.textarea`
  display: block;
  width: 100%;
  padding: 5px;
  font-size: 1rem;
  background-color: var(--background-color);
  color: var(--text-color);
  border-radius: 5px;

  border: 1px solid var(--border-color);
  transition: border 0.1s linear;
  &:focus {
    outline: none;
    border: 1px solid var(--text-color);
  }

`

export default FormTextarea