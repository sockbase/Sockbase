import styled from 'styled-components'

const FormTextarea = styled.textarea<{ hasError?: boolean }>`
  display: block;
  width: 100%;
  padding: 10px;
  border: 2px solid var(--outline-color);
  border-radius: 5px 5px 0 0;
  background-color: var(--background-color);
  color: var(--text-color);
  
  resize: vertical;
  min-height: 50px;

  transition: border 0.1s linear;

  &:focus {
    border: 2px solid var(--primary-brand-color);
    outline: none;
  }

  &:last-child {
  border-radius: 5px;
  }
  
  ${props => props.hasError && {
    border: '2px solid #ff2222 !important',
    boxShadow: '0 2px 5px #ff222288 !important'
  }}
  
  &:disabled {
    background-color: var(--background-disabled-color);
    color: var(--text-disabled-color);
  }
`

export default FormTextarea
