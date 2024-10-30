import styled from 'styled-components'

const FormTextarea = styled.textarea<{ hasError?: boolean }>`
  display: block;
  width: 100%;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background-color: var(--inputfield-background-color);
  color: var(--text-color);
  
  resize: vertical;
  min-height: 7.5rem;

  transition: border 0.1s linear;

  &:focus {
    border: 1px solid var(--primary-color);
    outline: none;
  }

  &:not(:last-child) {
    border-radius: 5px 5px 0 0;
  }
  
  ${props => props.hasError && {
    border: '2px solid #ff2222 !important',
    boxShadow: '0 2px 5px #ff222288 !important'
  }}
  
  &:disabled {
    background-color: var(--disabled-background-color);
    color: var(--disabled-text-color);
  }
`

export default FormTextarea
